package net.creasource.audio

import java.io.File
import java.nio.file.Files

import akka.NotUsed
import akka.stream.scaladsl.{Source, StreamConverters}
import org.jaudiotagger.audio.AudioHeader
import org.jaudiotagger.tag.{FieldKey, Tag}

import scala.util.Try

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

  private def getMetadata2(audioFile: File): (TrackMetadata, AlbumCover) = {
    import org.jaudiotagger.audio.AudioFileIO
    val f = AudioFileIO.read(audioFile)
    val tag: Option[Tag] = Option(f.getTag)
    val audioHeader: AudioHeader = f.getAudioHeader
    tag match {
      case Some(tags) =>
        val metadata = TrackMetadata(
          location = audioFile.getAbsolutePath,
          title = Option(tags.getFirst(FieldKey.TITLE)).map(_.trim),
          artist = Option(tags.getFirst(FieldKey.ARTIST)).map(_.trim),
          albumArtist = Option(tags.getFirst(FieldKey.ALBUM_ARTIST)).map(_.trim),
          album = Option(tags.getFirst(FieldKey.ALBUM)).map(_.trim),
          year = Option(tags.getFirst(FieldKey.YEAR)).map(_.trim),
          duration = audioHeader.getTrackLength)
        val albumCover = if (tags.getFirstArtwork != null) {
          Some(tags.getFirstArtwork.getBinaryData, tags.getFirstArtwork.getMimeType)
        } else {
          None
        }
        (metadata, albumCover)
      case None =>
        val metadata = TrackMetadata(
          location = audioFile.getAbsolutePath,
          title = None,
          artist = None,
          albumArtist = None,
          album = None,
          year = None,
          duration = audioHeader.getTrackLength)
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
    val supportedFormats: Seq[String] = Seq("mp3", "ogg", "flac") // wma, m4a
    StreamConverters
      .fromJavaStream(() => Files.walk(folder.toPath))
      .filter{ path =>
        def isSupportedFile: Boolean = {
          val chunks = path.getFileName.toString.split("""\.""")
          val extension = chunks(chunks.size - 1).toLowerCase
          supportedFormats.contains(extension)
        }
        !path.toFile.isDirectory && isSupportedFile
      }
      .map(path => Try(getMetadata2(path.toFile)).recover{case _ => getMetadata(path.toFile)}.get)
  }



}
