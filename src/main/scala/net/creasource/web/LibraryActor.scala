package net.creasource.web

import java.io._
import java.nio.file.{Files, Path, Paths}

import akka.actor.{Actor, ActorRef, Props, Stash, Terminated}
import akka.event.Logging
import akka.stream.IOResult
import akka.stream.scaladsl.{Flow, Framing, Sink, Source, StreamConverters}
import akka.util.ByteString
import akka.{Done, NotUsed}
import net.creasource.audio.LibraryScanner.{AlbumCoverOpt, getMetadata, getMetadata2}
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

  case object CheckTracks
  case object Register
  case class NewTrack(track: Track)
  case class DeletedTrack(track: Track)

  case object GetLibraries
  case class Libraries(libraries: List[String])

  case class AddLibrary(library: String)
  case class RemoveLibrary(library: String)
  case class SetLibraries(libraries: List[String])

  sealed trait LibraryChangeResult
  case object LibraryChangeSuccess extends LibraryChangeResult
  case class LibraryChangeFailed(reason: String) extends LibraryChangeResult

  case object ScanLibrary
  case object GetTracks

  def props()(implicit application: Application): Props = Props(new LibraryActor())

}

class LibraryActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  private case class AddTrack(track: Track, broadcast: Boolean = false)
  private case object MarkForSaving
  private case object WriteTracksFile

  private val logger = Logging(context.system, this)

  import context.dispatcher
  import application.materializer

  var libraries: List[String] = _

  var tracks: Seq[Track] = Seq.empty[Track]

  // val uploadFolder: String = application.config.getString("music.uploadFolder")

  val cacheFolder: String = application.config.getString("music.cacheFolder")

  val tracksFile: File = new File(cacheFolder + "/tracks.json")

  val librariesFile: File = new File(cacheFolder + "/libraries.json")

  val watchActor: ActorRef = context.actorOf(WatchActor.props, "WatchService")

  var listeners: Seq[ActorRef] = Seq.empty

  var markedForSaving = false
  application.system.scheduler.schedule(2.seconds, 2.seconds, self, WriteTracksFile)

  override def preStart(): Unit = {
    new File(cacheFolder + "/covers").mkdirs()

    tracksFile.createNewFile()
    librariesFile.createNewFile()

    for {
      _ <- loadTracksFromFile()
      _ = self ! CheckTracks
      libs <- loadLibrariesFromFile()
    } yield {
      val libraries: List[Path] = libs match {
        case Nil => List(Paths.get(application.config.getString("music.library")))
        case list => list
      }
      libraries.foreach(lib => watchActor ! WatchDir(lib))
      self ! SetLibraries(libraries.map(_.toString)) // TODO use Path instead of String
    }
  }

  def receive: Receive = {

    case Register =>
      val listener = sender()
      listeners +:= listener
      context.watch(listener)
      logger.debug("Listener registered: " + listener)

    case Terminated(listener) =>
      listeners = listeners diff List(listener)
      logger.debug("Listener unregistered: " + listener)

    case MarkForSaving => markedForSaving = true

    case WriteTracksFile =>
      if (markedForSaving) {
        logger.debug("Tracks have been marked for saving.")
        writeTracksToFile()
        markedForSaving = false
      }

    case GetLibraries => sender ! Libraries(libraries)

    case AddLibrary(library) =>
      if (libraries.contains(library)) {
        sender() ! LibraryChangeFailed(s"'$library' is already a library folder")
      } else {
        val file = new File(library)
        // TODO manage exception, e.g. read access denied
        if (file.isDirectory) {
          libraries +:= file.getAbsolutePath
          watchActor ! WatchDir(file.toPath)
          sender() ! LibraryChangeSuccess
        } else {
          sender() ! LibraryChangeFailed(s"'$file' is not a directory")
        }
      }
      writeLibrariesToFile()

    case RemoveLibrary(library) =>
      if (libraries.contains(library)) {
        libraries = libraries diff List(library)
        sender() ! LibraryChangeSuccess
      } else {
        sender() ! LibraryChangeFailed(s"$library is not a known library folder.")
      }
      writeLibrariesToFile()

    case SetLibraries(libs) =>
      libraries = libs
      writeLibrariesToFile()

    case ScanLibrary =>
      import context.dispatcher
      tracks = Seq.empty
      val a: Source[Track, NotUsed] = getTrackSource
        .watchTermination()((_, f) => {
          // f.onComplete(_ => self ! MarkForSaving)
          NotUsed
        })
      sender() ! a

    case GetTracks => sender() ! tracks

    case AddTrack(track, broadcast) =>
      if (!tracks.map(_.url).contains(track.url)) {
        logger.debug("New track added: " + track.metadata.location)
        tracks +:= track
        if (broadcast) {
          listeners.foreach(listener => listener ! NewTrack(track))
        }
      }

    case Created(file) =>
      logger.debug("File creation: " + file.toString)
      if (!file.isDirectory && !tracks.exists(track => track.metadata.location == file.toString)) {
        handleNewFile(file)
        markedForSaving = true
      }

    case Deleted(file) =>
      logger.debug("File deletion notification: " + file.toString)
      tracks.filter(track => track.metadata.location.startsWith(file.toString)).foreach { track =>
        logger.debug("Deleting track: " + track.toString)
        tracks = tracks diff List(track)
        listeners.foreach(listener => listener ! DeletedTrack(track))
        markedForSaving = true
      }

    case CheckTracks =>
      tracks.map(track => new File(track.metadata.location))
            .filter(file => !file.exists())
            .foreach(deleted => self ! Deleted(deleted))

  }

  def handleNewFile(file: File): Unit = {
    if (!file.isDirectory) {
      val libOpt = libraries.find(lib => file.toPath.startsWith(lib))
      libOpt match {
        case Some(lib) =>
          Source(Seq(file.toPath))
            .via(extractMetadataFlow)
            .via(metadataToTrackFlow(new File(lib)))
            .runWith(Sink.foreach(track => {
              self ! AddTrack(track, broadcast = true)
              // self ! MarkForSaving
            }))
            .onComplete {
              case Success(Done) =>
              case Failure(t) => logger.error(t, "An error occurred!")
            }
        case None => logger.warning("Got noticed for a file not in libraries: " + file.toString)
      }
    }
  }

  def extractMetadataFlow: Flow[Path, (TrackMetadata, AlbumCoverOpt), NotUsed] = {
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

  def metadataToTrackFlow(libraryFolder: File): Flow[(TrackMetadata, AlbumCoverOpt), Track, NotUsed] = {
    Flow[(TrackMetadata, AlbumCoverOpt)].map { case (metadata, coverOpt) =>
      val relativePath = libraryFolder
        .toPath
        .relativize(Paths.get(metadata.location))
        .toString
        .replaceAll("""\\""", "/")
      val url = s"/music/$relativePath"
      Track(
        url = url,
        metadata = metadata,
        coverUrl = coverToFile(coverOpt, metadata).map(f => "/cache/covers/" + f.getName)
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
      .map(new File(_))
      .map(scan)
      .fold(Source.empty)(_ concat _)
      .alsoTo(Sink.foreach(track => self ! AddTrack(track)))
  }

  // https://github.com/mpatric/mp3agic-examples/blob/master/src/main/java/com/mpatric/mp3agic/app/Mp3Pics.java
  private def coverToFile(coverOpt: AlbumCoverOpt, metadata: TrackMetadata): Option[File] = {

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

    coverOpt match {
      case None => None
      case Some((cover, mimeType)) =>
        if ((metadata.artist.isDefined || metadata.albumArtist.isDefined) && metadata.album.isDefined) {
          val file: File = {
            val extension = if (mimeType.indexOf("/") > 0) {
              "." + mimeType.substring(mimeType.indexOf("/") + 1).toLowerCase
            } else {
              "." + mimeType.toLowerCase
            }
            new File(cacheFolder)
              .toPath
              .resolve("covers")
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
  }

  def writeTracksToFile(): Future[Done] = {
    val f = Source(tracks)
      .map(t => ByteString(t.toJson.compactPrint + "\n"))
      .runWith(StreamConverters.fromOutputStream(() => new FileOutputStream(tracksFile), autoFlush = true))
      .transform {
        case Success(result) => result.status
        case Failure(t) => Failure(t)
      }
    f.onComplete {
      case Success(Done) => logger.info("Successfully wrote the tracks file.")
      case Failure(t) => logger.error(t, "Error writing the tracks file.")
    }
    f
  }

  def loadTracksFromFile(): Future[Done] = {
    val f = StreamConverters
      .fromInputStream(() => new FileInputStream(tracksFile))
      .via(Framing.delimiter(ByteString("\n"), maximumFrameLength = 1000, allowTruncation = false))
      .map(_.utf8String)
      .map(_.parseJson.convertTo[Track])
      .runWith(Sink.foreach(self ! AddTrack(_)))
    f.onComplete {
      case Success(Done) => logger.info("Successfully read the tracks file.")
      case Failure(t) => logger.error(t, "Failure reading the tracks file.")
    }
    f
  }

  def writeLibrariesToFile(): Future[Done] = {
    val sink: Sink[ByteString, Future[IOResult]] =
      StreamConverters.fromOutputStream(() => new FileOutputStream(librariesFile), autoFlush = true)
    val f = Source(libraries)
      .map(t => ByteString(t.toJson.compactPrint + "\n"))
      .runWith(sink)
      .transform {
        case Success(result) => result.status
        case Failure(t) => Failure(t)
      }
    f.onComplete {
      case Success(Done) => logger.info("Successfully wrote the libraries file.")
      case Failure(t) => logger.error(t, "Error writing the libraries file.")
    }
    f
  }

  def loadLibrariesFromFile(): Future[List[Path]] = {
    val result: Future[List[Path]] = StreamConverters
      .fromInputStream(() => new FileInputStream(librariesFile))
      .via(Framing.delimiter(ByteString("\n"), maximumFrameLength = 1000, allowTruncation = false))
      .map(_.utf8String)
      .map(_.parseJson.convertTo[String])
      .runWith(Sink.fold(List.empty[String])((list, value) => list :+ value))
      .map(_.map(l => Paths.get(l)))
    result.onComplete {
      case Success(_) => logger.info("Successfully read the libraries file.")
      case Failure(t) => logger.error(t, "Failure reading the libraries file.")
    }
    result
  }

}
