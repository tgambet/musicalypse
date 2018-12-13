package net.creasource.audio

import java.io.File
import java.nio.file.Files

import net.creasource.model.{AlbumCover, TrackMetadata}

object TagExtractor {

  def getMetadata(audioFile: File): TrackMetadata = {
    import com.mpatric.mp3agic.Mp3File
    val mp3file = new Mp3File(audioFile)
    if (mp3file.hasId3v2Tag) {
      val tags = mp3file.getId3v2Tag
      TrackMetadata(
        location = audioFile.toPath.toAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        albumArtist = Option(tags.getAlbumArtist).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        year = Option(tags.getYear).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt,
        cover = Option(tags.getAlbumImage)
          .map(image => AlbumCover(image, tags.getAlbumImageMimeType))
          .orElse(getCoverInFolder(audioFile))
      )
    } else if (mp3file.hasId3v1Tag) {
      // println("WARN - IDv1 tags found for file " + audioFile)
      val tags = mp3file.getId3v1Tag
      TrackMetadata(
        location = audioFile.toPath.toAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        albumArtist = Option(tags.getArtist).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        year = Option(tags.getYear).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt,
        cover = getCoverInFolder(audioFile))
    } else {
      TrackMetadata(
        location = audioFile.toPath.toAbsolutePath,
        title = None,
        artist = None,
        albumArtist = None,
        album = None,
        year = None,
        duration = mp3file.getLengthInSeconds.toInt,
        cover = getCoverInFolder(audioFile)
      )
    }
  }

  def getMetadata2(audioFile: File): TrackMetadata = {
    import org.jaudiotagger.audio.AudioFileIO
    import org.jaudiotagger.audio.AudioHeader
    import org.jaudiotagger.tag.{FieldKey, Tag}
    val f = AudioFileIO.read(audioFile)
    val tag: Option[Tag] = Option(f.getTag)
    val audioHeader: AudioHeader = f.getAudioHeader
    tag match {
      case Some(tags) =>
        TrackMetadata(
          location = audioFile.toPath.toAbsolutePath,
          title = Option(tags.getFirst(FieldKey.TITLE)).map(_.trim),
          artist = Option(tags.getFirst(FieldKey.ARTIST)).map(_.trim),
          albumArtist = Option(tags.getFirst(FieldKey.ALBUM_ARTIST)).map(_.trim),
          album = Option(tags.getFirst(FieldKey.ALBUM)).map(_.trim),
          year = Option(tags.getFirst(FieldKey.YEAR)).map(_.trim),
          duration = audioHeader.getTrackLength,
          cover = Option(tags.getFirstArtwork)
            .map(artwork => AlbumCover(artwork.getBinaryData, artwork.getMimeType))
            .orElse(getCoverInFolder(audioFile))
        )
      case None =>
        TrackMetadata(
          location = audioFile.toPath.toAbsolutePath,
          title = None,
          artist = None,
          albumArtist = None,
          album = None,
          year = None,
          duration = audioHeader.getTrackLength,
          cover = None
        )
    }
  }

  def getCoverInFolder(file: File): Option[AlbumCover] = {
    val supportedExtension = Seq("jpg", "jpeg", "png")
    val folder = file.toPath.getParent.toFile
    val images = folder.listFiles().filter(file => {
      val extension = file.toPath.getFileName.toString.split("""\.""").last.toLowerCase
      supportedExtension.contains(extension)
    })

    images
      .find(f => f.toPath.toString.contains("Large"))
      .orElse(images.headOption)
      .map(f => {println(f); f})
      .map(f => AlbumCover(Files.readAllBytes(f.toPath), Files.probeContentType(f.toPath)))
  }

}
