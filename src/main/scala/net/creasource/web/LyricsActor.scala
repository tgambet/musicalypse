package net.creasource.web

import java.io.{FileInputStream, FileOutputStream}
import java.nio.file.{Path, Paths}

import akka.Done
import akka.actor.{Actor, Props}
import akka.event.Logging
import akka.stream.scaladsl.{Sink, Source, StreamConverters}
import akka.util.ByteString
import net.creasource.core.Application

import scala.concurrent.Future
import scala.util.{Failure, Success}

object LyricsActor {

  case class GetLyrics(artist: String, title: String)

  sealed trait GetLyricsResult
  case class LyricsFound(lyrics: String) extends GetLyricsResult
  case object LyricsNotFound extends GetLyricsResult

  case class SaveLyrics(lyrics: String, artist: String, title: String)

  sealed trait SaveLyricsResult
  case object LyricsSaved extends SaveLyricsResult
  case class LyricsSaveError(error: String) extends SaveLyricsResult

  def props()(implicit application: Application): Props = Props(new LyricsActor())

}

class LyricsActor()(implicit application: Application) extends Actor with JsonSupport {

  import LyricsActor._
  import application.materializer
  import context.dispatcher

  private val logger = Logging(context.system, this)

  val cacheFolder: Path = Paths.get(application.config.getString("music.cacheFolder"))
  val lyricsFolder: Path = cacheFolder.resolve("lyrics")

  override def preStart(): Unit = {
    lyricsFolder.toFile.mkdirs()
  }

  override def receive: Receive = {

    case GetLyrics(artist, title) =>
      val client = sender()
      loadLyrics(artist, title).onComplete{
        case Success(lyrics) => client ! LyricsFound(lyrics)
        case Failure(_) => client ! LyricsNotFound
      }

    case SaveLyrics(lyrics, artist, title) =>
      val client = sender()
      this.saveLyrics(lyrics, artist, title).onComplete {
        case Success(Done) => client ! LyricsSaved
        case Failure(t) => client ! LyricsSaveError(t.getMessage)
      }

  }

  def loadLyrics(artist: String, title: String): Future[String] = {
    val lyricsFile = lyricsFolder.resolve(toCompressedString(artist) + "-" + toCompressedString(title) + ".txt").toFile
    StreamConverters
      .fromInputStream(() => new FileInputStream(lyricsFile))
      .map(_.utf8String)
      .runWith(Sink.head)
  }

  def saveLyrics(lyrics: String, artist: String, title: String): Future[Done] = {
    val lyricsFile = lyricsFolder.resolve(toCompressedString(artist) + "-" + toCompressedString(title) + ".txt").toFile
    Source.single(ByteString(lyrics))
      .runWith(StreamConverters.fromOutputStream(() => new FileOutputStream(lyricsFile), autoFlush = true))
      .transform {
        case Success(result) => result.status
        case Failure(t) => Failure(t)
      }
  }

  def toCompressedString(s: String): String = {
    val compressed = new StringBuffer
    var i = 0
    while (i < s.length) {
      val ch = s.charAt(i)
      if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || (ch == '&') || (ch == '+') || (ch == '(') || (ch == ')'))
        compressed.append(ch)
      i += 1
    }
    val res = compressed.toString
    res.substring(0, scala.math.min(res.length, 50))
  }

}
