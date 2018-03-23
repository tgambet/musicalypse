package net.creasource.web

import java.io.File

import akka.NotUsed
import akka.actor.{Actor, Props, Stash}
import akka.stream.scaladsl.{Flow, Source}
import net.creasource.audio.{LibraryScanner, Track, TrackMetadata}
import net.creasource.core.Application
import net.creasource.web.LibraryActor._

import scala.collection.JavaConverters._

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

  var libraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  var uploadFolder: String = application.config.getString("music.uploadFolder")

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
    val updateTracksFlow: Flow[Track, Track, NotUsed] = Flow[Track].map(t => { self ! AddTrack(t); t })
    (libraries :+ uploadFolder)
      .map(new File(_))
      .map(f => LibraryScanner.scan(f).map(metadata => Track(url = getUrlFromAudioMetadata(metadata, f), metadata = metadata)))
      .fold(Source.empty)(_ concat _)
      .via(updateTracksFlow)
  }

  private def getUrlFromAudioMetadata(metadata: TrackMetadata, libraryFolder: File): String = {
    "/music/" + libraryFolder.toPath.relativize(new File(metadata.location).toPath).toString.replaceAll("""\\""", "/")
  }

}
