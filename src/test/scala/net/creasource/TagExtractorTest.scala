package net.creasource

import java.io.File

import akka.Done
import akka.actor.ActorSystem
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.Sink
import net.creasource.audio._

import scala.concurrent.{Await, Future}

class TagExtractorTest extends SimpleTest {

  "A LibraryScanner" should {

    "find audio files in a folder" in {

      //val scanner = new LibraryScanner(new File("D:\\Musique\\Metallica"))

      //val files = scanner.getAudioFiles(new File("C:\\Users\\Thomas\\Workspace\\musicalypse\\web\\src\\assets\\music"))
      //files.foreach(println)
      //val metas = scanner.scanLibrary(new File("D:\\Musique\\Metallica"))
      //metas.foreach(println)

//      implicit val actorSystem: ActorSystem = ActorSystem()
//      implicit val materializer: ActorMaterializer = ActorMaterializer()
//
//      val sink = Sink.foreach[TrackMetadata](m => println(m))
//      val f: Future[Done] = LibraryScanner.scan(new File("D:\\Musique\\Metallica")).runWith(sink)
//
//      import scala.concurrent.duration._
//      Await.result(f, 10.seconds)

    }

  }

}

