package net.creasource.audio

import java.io.File
import java.nio.file.Files

import akka.NotUsed
import akka.stream.scaladsl.{Source, StreamConverters}

import scala.concurrent.Future

class LibraryScanner(val libraryFolder: File) {

  assert(libraryFolder.isDirectory, s"Library folder $libraryFolder is not a directory")

  private def getMetadata(audioFile: File): TrackMetadata = {
    import com.mpatric.mp3agic.Mp3File
    val mp3file = new Mp3File(audioFile)

    if (mp3file.hasId3v2Tag) {
      val tags = mp3file.getId3v2Tag
      TrackMetadata(
        location = audioFile.getAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        albumArtist = Option(tags.getAlbumArtist).orElse(Option(tags.getArtist)).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        year = Option(tags.getYear).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt)
    } else {
      TrackMetadata(
        location = audioFile.getAbsolutePath,
        title = None,
        artist = None,
        albumArtist = None,
        album = None,
        year = None,
        duration = mp3file.getLengthInSeconds.toInt)
    }
  }

  def scanLibrary(): Source[TrackMetadata, NotUsed] = {
    import scala.concurrent.ExecutionContext.Implicits.global
    StreamConverters
      .fromJavaStream(() => Files.walk(libraryFolder.toPath))
      .filter(path => !path.toFile.isDirectory && path.toString.endsWith(".mp3"))
      .mapAsync(4)(path => Future(getMetadata(path.toFile)))
  }



}
