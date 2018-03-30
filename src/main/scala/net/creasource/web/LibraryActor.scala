package net.creasource.web

import java.io.{File, RandomAccessFile}

import akka.NotUsed
import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import akka.stream.scaladsl.{Flow, Source}
import net.creasource.audio.LibraryScanner.AlbumCover
import net.creasource.audio.{LibraryScanner, Track, TrackMetadata}
import net.creasource.core.Application
import net.creasource.web.LibraryActor._

import scala.collection.JavaConverters._
import scala.util.Try

object LibraryActor {

  case object GetLibraries
  case class Libraries(libraries: List[String])

  case class AddLibrary(library: String)
  case class RemoveLibrary(library: String)
  sealed trait LibraryChangeResult
  case object LibraryChangeSuccess extends LibraryChangeResult
  case class LibraryChangeFailed(reason: String) extends LibraryChangeResult

  case object ScanLibrary
  case object GetTracks

  def props()(implicit application: Application): Props = Props(new LibraryActor())

}

class LibraryActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  private case class AddTrack(track: Track)

  private val logger = Logging(context.system, this)

  var libraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  var uploadFolder: String = application.config.getString("music.uploadFolder")

  var cacheFolder: String = application.config.getString("music.cacheFolder")

  var tracks: Seq[Track] = Seq.empty

  def receive: Receive = {

    case GetLibraries => sender ! Libraries(libraries :+ uploadFolder)

    case AddLibrary(library) =>
      if (libraries.contains(library)) {
        sender() ! LibraryChangeFailed(s"'$library' is already a library folder")
      } else {
        val file = new File(library)
        // TODO manage exception, e.g. read access denied
        if (file.isDirectory) {
          libraries +:= file.toString
          sender() ! LibraryChangeSuccess
        } else {
          sender() ! LibraryChangeFailed(s"'$file' is not a directory")
        }
      }

    case RemoveLibrary(library) =>
      if (libraries.contains(library)) {
        libraries = libraries diff List(library)
        sender() ! LibraryChangeSuccess
      } else {
        sender() ! LibraryChangeFailed(s"$library is not a known library folder or cannot be deleted.")
      }

    case ScanLibrary =>
      tracks = Seq.empty
      sender() ! getTrackSource

    case GetTracks =>
      sender() ! tracks

    case AddTrack(track) =>
      if (!tracks.contains(track)) tracks +:= track

  }

  private def getTrackSource: Source[Track, NotUsed] = {
    val updateTracksFlow: Flow[Track, Track, NotUsed] =
      Flow[Track].map(t => { self ! AddTrack(t); t })

    def buildCacheFlow(folder: File): Flow[(TrackMetadata, AlbumCover), Track, NotUsed] =
      Flow[(TrackMetadata, AlbumCover)].map {
        case (metadata, None) =>
          Track(getUrlFromMetadata(metadata, folder), metadata, None)

        case (metadata, Some((cover, mimeType))) =>
          val coverFile = writeCoverToCacheFile(cover, mimeType, metadata)
          Track(
            url = getUrlFromMetadata(metadata, folder),
            metadata = metadata,
            coverUrl = Some("/cache/" + coverFile.getName)
          )

      }

    (libraries :+ uploadFolder)
      .map(new File(_))
      .map(folder => LibraryScanner.scan(folder).via(buildCacheFlow(folder)))
      .fold(Source.empty)(_ concat _)
      .via(updateTracksFlow)
  }

  // https://github.com/mpatric/mp3agic-examples/blob/master/src/main/java/com/mpatric/mp3agic/app/Mp3Pics.java

  private def writeCoverToCacheFile(cover: Array[Byte], mimeType: String, metadata: TrackMetadata): File = {

    assert(metadata.artist.isDefined, "No artist tag found! Cannot create an image for this file. " + metadata.location)
    assert(metadata.album.isDefined, "No album tag found! Cannot create an image for this file. " + metadata.location)

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

    val file: File = {
      val extension = if (mimeType.indexOf("/") > 0) {
        "." + mimeType.substring(mimeType.indexOf("/") + 1).toLowerCase
      } else {
        "." + mimeType.toLowerCase
      }
      new File(cacheFolder)
        .toPath
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

    file
  }

  private def getUrlFromMetadata(metadata: TrackMetadata, libraryFolder: File): String = {
    "/music/" + libraryFolder.toPath.relativize(new File(metadata.location).toPath).toString.replaceAll("""\\""", "/")
  }

}
