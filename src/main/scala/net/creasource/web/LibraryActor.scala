package net.creasource.web

import java.io._
import java.nio.file.{Files, Path, Paths}

import akka.actor.{Actor, ActorRef, Props, Stash, Terminated}
import akka.event.Logging
import akka.stream.IOResult
import akka.stream.scaladsl.{Flow, Framing, Sink, Source, StreamConverters}
import akka.util.ByteString
import akka.{Done, NotUsed}
import net.creasource.audio.LibraryScanner.{AlbumCover, getMetadata, getMetadata2}
import net.creasource.audio.{Track, TrackMetadata}
import net.creasource.core.Application
import net.creasource.io._
import net.creasource.web.LibraryActor._
import spray.json._

import scala.collection.immutable.Seq
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success, Try}

object LibraryActor {

  case object Register
  case class NewTrack(track: Track)
  case class DeletedTrack(track: Track)

  case object ScanLibrary
  case object GetTracks
  case object GetLibraries
  case class Libraries(libraries: Seq[Path])

  case class AddLibrary(library: String)
  case class RemoveLibrary(library: String)

  sealed trait LibraryChangeResult
  case object LibraryChangeSuccess extends LibraryChangeResult
  case class LibraryChangeFailed(reason: String) extends LibraryChangeResult

  def props()(implicit application: Application): Props = Props(new LibraryActor())

}

class LibraryActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  import context.dispatcher
  import application.materializer

  private case class SetLibraries(libraries: Seq[Path])
  private case class SetTracks(tracks: Seq[Track])
  private case class AddTrack(track: Track, broadcast: Boolean = false)
  private case object MarkForSaving
  private case object WriteTracksFile
  // private case object CheckTracks

  private val logger = Logging(context.system, this)

  var tracks: Seq[Track] = _
  var libraries: Seq[Path] = _
  var listeners: Seq[ActorRef] = Seq.empty

  // val uploadFolder: String = application.config.getString("music.uploadFolder")

  val cacheFolder: Path = Paths.get(application.config.getString("music.cacheFolder"))
  val coversFolder: Path = cacheFolder.resolve("covers")
  val tracksFile: File = cacheFolder.resolve("tracks.json").toFile
  val librariesFile: File = cacheFolder.resolve("libraries.json").toFile

  val watchActor: ActorRef = context.actorOf(WatchActor.props, "WatchService")

  var markedForSaving = false
  application.system.scheduler.schedule(2.seconds, 2.seconds, self, WriteTracksFile)

  val isFirstLaunch: Boolean = !librariesFile.exists()

  override def preStart(): Unit = {
    coversFolder.toFile.mkdirs()

    logger.info("Loading libraries...")
    for {
      l0 <- loadLibraries()
      _  = logger.info(l0.length + " libraries have been loaded")
      _  = logger.info("Filtering libraries...")
      l1 = l0.filter(lib => lib.toFile.isDirectory)
      _  = logger.info(l0.length - l1.length + " libraries have been removed.")
      _  = logger.info("Saving libraries to file...")
      _  <- saveLibraries(l1)
      _  = logger.info("Loading tracks...")
      t0 <- loadTracks()
      _  = logger.info(t0.length + " tracks have been loaded.")
      _  = logger.info("Filtering tracks...")
      t1 = t0.filter(t => l1.exists(lib => t.metadata.location.startsWith(lib.toString)))
      t2 = t1.filter(t => new File(t.metadata.location).exists)
      _  = logger.info(t0.length - t2.length + " tracks have been removed.")
      t3 <- if (isFirstLaunch) {
              logger.info("First launch detected. Skipping looking for new tracks.")
              Future.successful(t2)
            } else {
              logger.info("Looking for new tracks...")
              loadNewTracks(t2, l1)
            }
      _  = logger.info(t3.length - t2.length + " tracks have been added.")
      _  = logger.info("Saving tracks to file...")
      _  <- saveTracks(t3)
      _  = logger.info("Watching library folders...")
      _  <- watchLibraryFolders(l1)
    } yield {
      self ! SetLibraries(l1)
      self ! SetTracks(t3)
      Done
    }
  }

  def receive: Receive = {

    case SetLibraries(l) =>
      libraries = l
      unstashAll()

    case SetTracks(t) =>
      tracks = t
      unstashAll()

    case GetLibraries =>
      if (libraries == null) {
        stash()
      } else {
        sender ! Libraries(libraries)
      }

    case GetTracks =>
      if (tracks == null) {
        stash()
      } else {
        sender() ! tracks
      }

    case Register =>
      val listener = sender()
      listeners +:= listener
      context.watch(listener)
      logger.debug("Listener registered: " + listener)
      unstashAll()

    case Terminated(listener) =>
      listeners = listeners diff List(listener)
      logger.debug("Listener unregistered: " + listener)

    // case NotifyListeners() =>

    case MarkForSaving => markedForSaving = true

    case WriteTracksFile =>
      if (markedForSaving) {
        logger.debug("Tracks have been marked for saving.")
        saveTracks(tracks)
        markedForSaving = false
      }

    case AddLibrary(library) =>
      Try(Paths.get(library)) match {
        case Success(lib) =>
          if (libraries.contains(lib)) {
            sender() ! LibraryChangeFailed(s"'$lib' is already a library folder")
          } else {
            if (lib.toFile.isDirectory && lib.toFile.canRead) {
              val client = sender()
              libraries +:= lib.toAbsolutePath
              saveLibraries(libraries).foreach(_ => {
                watchActor ! WatchDir(lib.toAbsolutePath)
                client ! LibraryChangeSuccess
              })
            } else {
              sender() ! LibraryChangeFailed(s"'$lib' is not a directory or cannot be read")
            }
          }
        case Failure(_) => sender() ! LibraryChangeFailed(s"'$library' is not a valid path")
      }

    case RemoveLibrary(library) =>
      Try(Paths.get(library)) match {
        case Success(lib) =>
          if (libraries.contains(lib)) {
            val client = sender()
            libraries = libraries diff List(lib)
            saveLibraries(libraries).foreach(_ => client ! LibraryChangeSuccess)
          } else {
            sender() ! LibraryChangeFailed(s"$lib is not a known library folder.")
          }
        case Failure(t) => sender() ! LibraryChangeFailed(s"$library is not a valid path.")
      }

    case ScanLibrary =>
      import context.dispatcher
      tracks = Seq.empty
      val a: Source[Track, NotUsed] = getTrackSource
        .watchTermination()((_, f) => {
          f.onComplete(_ => self ! MarkForSaving)
          NotUsed
        })
      sender() ! a

    case AddTrack(track, broadcast) =>
      if (!tracks.map(_.url).contains(track.url)) {
        logger.debug("New track added: " + track.metadata.location)
        tracks +:= track
        if (broadcast) {
          listeners.foreach(listener => listener ! NewTrack(track))
        }
        markedForSaving = true
      }

    case Created(file) =>
      logger.debug("File creation: " + file.getAbsolutePath)
      if (!file.isDirectory && !tracks.exists(track => track.metadata.location == file.getAbsolutePath)) {
        val libOpt = libraries.find(lib => file.toPath.startsWith(lib))
        libOpt match {
          case Some(lib) =>
            Source(Seq(file.toPath))
              .via(extractMetadataFlow)
              .via(metadataToTrackFlow(lib.toFile))
              .runWith(Sink.foreach(track => self ! AddTrack(track, broadcast = true)))
              .onComplete {
                case Success(Done) =>
                case Failure(t) => logger.error(t, "An error occurred!")
              }
          case None => logger.warning("Got noticed for a file not in libraries: " + file.getAbsolutePath)
        }
      } else {
        logger.debug("Ignoring file creation notification: " + file.getAbsolutePath)
      }

    case Deleted(file) =>
      logger.debug("File deletion notification: " + file.toString)
      tracks.filter(track => track.metadata.location.startsWith(file.toString)).foreach { track =>
        logger.debug("Deleting track: " + track.toString)
        tracks = tracks diff List(track)
        listeners.foreach(listener => listener ! DeletedTrack(track))
        markedForSaving = true
      }

/*    case CheckTracks =>
      tracks.map(track => new File(track.metadata.location))
            .filter(file => !file.exists())
            .foreach(deleted => self ! Deleted(deleted))*/

  }

  def extractMetadataFlow: Flow[Path, (TrackMetadata, Option[AlbumCover]), NotUsed] = {
    val supportedFormats: Seq[String] = Seq("mp3", "ogg", "flac")
    def isSupportedFile(path: Path): Boolean = {
      val extension = path.getFileName.toString.split("""\.""").last.toLowerCase
      supportedFormats.contains(extension)
    }
    Flow[Path]
      .filter(path => !path.toFile.isDirectory && isSupportedFile(path))
      .map(path => path.toFile)
      .map(file => Try(getMetadata2(file)).recover{case _ => getMetadata(file)})
      .collect{
        case tr if tr.isSuccess => tr.get
      }
  }

  def metadataToTrackFlow(libraryFolder: File): Flow[(TrackMetadata, Option[AlbumCover]), Track, NotUsed] = {
    Flow[(TrackMetadata, Option[AlbumCover])].map { case (metadata, coverOpt) =>
      val relativePath = libraryFolder
        .toPath
        .relativize(Paths.get(metadata.location))
        .toString
        .replaceAll("""\\""", "/")
      val url = s"/music/$relativePath"
      Track(
        url = url,
        metadata = metadata,
        coverUrl = coverOpt.flatMap(coverToFile(_, metadata)).map(f => "/cache/covers/" + f.getName)
      )
    }
  }

  def scan(folder: File): Source[Track, NotUsed] = {
    StreamConverters
      .fromJavaStream(() => Files.walk(folder.toPath))
      .via(extractMetadataFlow)
      .via(metadataToTrackFlow(folder))
  }

  def getTrackSource: Source[Track, NotUsed] = {
    libraries // Add upload folder here whn reimplemented
      .map(_.toFile)
      .map(scan)
      .fold(Source.empty)(_ concat _)
      .alsoTo(Sink.foreach(track => self ! AddTrack(track)))
  }

  // https://github.com/mpatric/mp3agic-examples/blob/master/src/main/java/com/mpatric/mp3agic/app/Mp3Pics.java
  def coverToFile(albumCover: AlbumCover, metadata: TrackMetadata): Option[File] = {

    def toCompressedString(s: String): String = {
      val compressed = new StringBuffer
      var i = 0
      while (i < s.length) {
        val ch = s.charAt(i)
        if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || (ch == '&') || (ch == '+') || (ch == '(') || (ch == ')'))
          compressed.append(ch)
        i += 1
      }
      compressed.toString
    }

    val cover = albumCover._1
    val mimeType = albumCover._2
    if ((metadata.artist.isDefined || metadata.albumArtist.isDefined) && metadata.album.isDefined) {
      val file: File = {
        val extension = if (mimeType.indexOf("/") > 0) {
          "." + mimeType.substring(mimeType.indexOf("/") + 1).toLowerCase
        } else {
          "." + mimeType.toLowerCase
        }
        coversFolder
          .resolve(toCompressedString(metadata.albumArtist.getOrElse(metadata.artist.get)) + "-" + toCompressedString(metadata.album.get) + extension)
          .toAbsolutePath
          .toFile
      }

      if (!file.exists()) {
        val randomAccessFile = new RandomAccessFile(file, "rw")
        try {
          randomAccessFile.write(cover)
        } finally {
          Try(randomAccessFile.close())
        }
      }

      Some(file)
    } else {
      logger.warning("Found a mp3 with a cover but no tags, ignoring: " + metadata.location)
      None
    }

  }

  def loadTracksFile(): Future[Seq[Track]] = {
    tracksFile.createNewFile()
    val f = StreamConverters
      .fromInputStream(() => new FileInputStream(tracksFile))
      .via(Framing.delimiter(ByteString("\n"), maximumFrameLength = 1000, allowTruncation = false))
      .map(_.utf8String)
      .map(_.parseJson.convertTo[Track])
      .runWith(Sink.seq)
    f.onComplete {
      case Success(_) => logger.debug("Successfully read the tracks file.")
      case Failure(t) => logger.error(t, "Failure reading the tracks file.")
    }
    f
  }

  def saveTracks(tracks: Seq[Track]): Future[Done] = {
    val f = Source(tracks)
      .map(t => ByteString(t.toJson.compactPrint + "\n"))
      .runWith(StreamConverters.fromOutputStream(() => new FileOutputStream(tracksFile), autoFlush = true))
      .transform {
        case Success(result) => result.status
        case Failure(t) => Failure(t)
      }
    f.onComplete {
      case Success(Done) => logger.debug("Successfully wrote the tracks file.")
      case Failure(t) => logger.error(t, "Error writing the tracks file.")
    }
    f
  }

  def loadLibrariesFile(): Future[List[Path]] = {
    librariesFile.createNewFile()
    val result: Future[List[Path]] = StreamConverters
      .fromInputStream(() => new FileInputStream(librariesFile))
      .via(Framing.delimiter(ByteString("\n"), maximumFrameLength = 1000, allowTruncation = false))
      .map(_.utf8String)
      .map(_.parseJson.convertTo[String])
      .runWith(Sink.fold(List.empty[String])((list, value) => list :+ value))
      .map(_.map(l => Paths.get(l)))
    result.onComplete {
      case Success(_) => logger.debug("Successfully read the libraries file.")
      case Failure(t) => logger.error(t, "Failure reading the libraries file.")
    }
    result
  }

  def saveLibraries(libraries: Seq[Path]): Future[Done] = {
    val sink: Sink[ByteString, Future[IOResult]] =
      StreamConverters.fromOutputStream(() => new FileOutputStream(librariesFile), autoFlush = true)
    val f = Source(libraries)
      .map(_.toString)
      .map(t => ByteString(t.toJson.compactPrint + "\n"))
      .runWith(sink)
      .transform {
        case Success(result) => result.status
        case Failure(t) => Failure(t)
      }
    f.onComplete {
      case Success(Done) => logger.debug("Successfully wrote the libraries file.")
      case Failure(t) => logger.error(t, "Error writing the libraries file.")
    }
    f
  }

  def loadLibraries(): Future[Seq[Path]] = {
    for {
      libs <- loadLibrariesFile()
    } yield {
      libs match {
        case Nil =>
          application.config.getString("music.library") match {
            case "" => Nil
            case lib => List(Paths.get(lib))
          }
        case list => list
      }
    }
  }

  def loadTracks(): Future[Seq[Track]] = loadTracksFile()

  def loadNewTracks(oldTracks: Seq[Track], libraries: Seq[Path]): Future[Seq[Track]] = {
    libraries
      .map(lib =>
        StreamConverters.fromJavaStream(() => Files.walk(lib))
          .filter(path => !path.toFile.isDirectory)
          .filter(path => !oldTracks.exists(track => track.metadata.location == path.toString))
          .via(extractMetadataFlow)
          .via(metadataToTrackFlow(lib.toFile)))
      .fold(Source.empty)(_ concat _)
      .runWith(Sink.seq)
      .map(_ ++: oldTracks)
  }

  def watchLibraryFolders(libraryFolders: Seq[Path]): Future[Done] = {
    Future.successful(Done)
  }

}
