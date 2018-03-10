package net.creasource.audio

import java.io.File

import akka.NotUsed
import akka.stream.scaladsl.Source

class LibraryScanner {

  def getAudioFiles(folder: File): List[File] = {
    if (folder.isDirectory) {
      folder.listFiles().map(file => {
        if (file.isDirectory) { getAudioFiles(file) }
        else {
          if (file.getName.endsWith(".mp3"))
            List(file)
          else
            List()
        }
      }).toList.flatten
    } else {
      List(folder)
    }
  }

  def getMetadata(audioFile: File): AudioMetadata = {
    import com.mpatric.mp3agic.Mp3File
    val mp3file = new Mp3File(audioFile)

    if (mp3file.hasId3v2Tag) {
      val tags = mp3file.getId3v2Tag
      AudioMetadata(
        source = audioFile.getAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt)
    } else {
      AudioMetadata(
        source = audioFile.getAbsolutePath,
        title = None,
        artist = None,
        album = None,
        duration = mp3file.getLengthInSeconds.toInt)
    }
  }

  def scanLibrary(folder: File): Source[AudioMetadata, NotUsed] = {
    val source = Source(getAudioFiles(folder))
    source.map(getMetadata)
  }



}
