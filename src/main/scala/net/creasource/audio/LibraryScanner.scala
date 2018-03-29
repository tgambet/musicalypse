package net.creasource.audio

import java.io.File
import java.nio.file.Files

import akka.NotUsed
import akka.stream.scaladsl.{Source, StreamConverters}

import scala.concurrent.Future

object LibraryScanner {

  type AlbumCover = Option[(Array[Byte], String)]

  private def getMetadata(audioFile: File): (TrackMetadata, AlbumCover) = {
    import com.mpatric.mp3agic.Mp3File
    val mp3file = new Mp3File(audioFile)
    if (mp3file.hasId3v2Tag) {
      val tags = mp3file.getId3v2Tag
      val metadata = TrackMetadata(
        location = audioFile.getAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        albumArtist = Option(tags.getAlbumArtist).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        year = Option(tags.getYear).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt)
      val albumCover = if (tags.getAlbumImage != null) {
        Some(tags.getAlbumImage, tags.getAlbumImageMimeType)
      } else {
        None
      }
      (metadata, albumCover)
    } else if (mp3file.hasId3v1Tag) {
      println("WARN - IDv1 tags found for file " + audioFile)
      val tags = mp3file.getId3v1Tag
      val metadata = TrackMetadata(
        location = audioFile.getAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        albumArtist = Option(tags.getArtist).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        year = Option(tags.getYear).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt)
      (metadata, None)
    } else {
      val metadata = TrackMetadata(
        location = audioFile.getAbsolutePath,
        title = None,
        artist = None,
        albumArtist = None,
        album = None,
        year = None,
        duration = mp3file.getLengthInSeconds.toInt)
      (metadata, None)
    }
  }

  private def getAlbumCover(audioFile: File): AlbumCover = {
    import com.mpatric.mp3agic.Mp3File
    val mp3file = new Mp3File(audioFile)
    if (mp3file.hasId3v2Tag) {
      val tags = mp3file.getId3v2Tag
      Some(tags.getAlbumImage, tags.getAlbumImageMimeType)
    } else {
      None
    }
  }

  def scan(folder: File): Source[(TrackMetadata, AlbumCover), NotUsed] = {
    assert(folder.isDirectory, s"Library folder $folder is not a directory")
    import scala.concurrent.ExecutionContext.Implicits.global
    StreamConverters
      .fromJavaStream(() => Files.walk(folder.toPath))
      .filter(path => !path.toFile.isDirectory && path.toString.endsWith(".mp3"))
      //.map(path => getMetadata(path.toFile))
      .mapAsync(4)(path => Future(getMetadata(path.toFile)))
  }



}
