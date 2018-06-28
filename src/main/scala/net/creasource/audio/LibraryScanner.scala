package net.creasource.audio

import java.io.File

object LibraryScanner {

  type AlbumCover = (Array[Byte], String)

  def getMetadata(audioFile: File): (TrackMetadata, Option[AlbumCover]) = {
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

  def getMetadata2(audioFile: File): (TrackMetadata, Option[AlbumCover]) = {
    import org.jaudiotagger.audio.AudioFileIO
    import org.jaudiotagger.audio.AudioHeader
    import org.jaudiotagger.tag.{FieldKey, Tag}
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

}
