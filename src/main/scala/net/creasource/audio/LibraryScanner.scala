package net.creasource.audio

import java.io.File

import akka.NotUsed
import akka.stream.scaladsl.Source

class LibraryScanner(val libraryFolder: File) {

  assert(libraryFolder.isDirectory, s"Library folder $libraryFolder is not a directory")

  private def getAudioFiles(folder: File): List[File] = {
    folder.listFiles().toList.flatMap(file => {
      if (file.isDirectory)
        getAudioFiles(file)
      else if (file.getName.endsWith(".mp3"))
        List(file)
      else
        List()
    })
  }

  private def getMetadata(audioFile: File): AudioMetadata = {
    import com.mpatric.mp3agic.Mp3File
    val mp3file = new Mp3File(audioFile)

    if (mp3file.hasId3v2Tag) {
      val tags = mp3file.getId3v2Tag
      AudioMetadata(
        location = audioFile.getAbsolutePath,
        title = Option(tags.getTitle).map(_.trim),
        artist = Option(tags.getArtist).map(_.trim),
        album = Option(tags.getAlbum).map(_.trim),
        duration = mp3file.getLengthInSeconds.toInt)
    } else {
      AudioMetadata(
        location = audioFile.getAbsolutePath,
        title = None,
        artist = None,
        album = None,
        duration = mp3file.getLengthInSeconds.toInt)
    }
  }

  def scanLibrary(): Source[AudioMetadata, NotUsed] = {
    val source = Source(getAudioFiles(libraryFolder))
    source.map(getMetadata)
  }



}
