package net.creasource.web

import java.io.File

import akka.actor.{Actor, Props, Stash}
import net.creasource.core.Application
import net.creasource.web.LibraryActor._

import scala.collection.JavaConverters._

object LibraryActor {

  case object GetLibraries
  case class Libraries(libraries: List[String])

  case class AddLibrary(library: String)
  sealed trait LibraryAdditionResult
  case object LibraryAdditionSuccess extends LibraryAdditionResult
  case class LibraryAdditionFailed(reason: String) extends LibraryAdditionResult

  def props()(implicit application: Application): Props = Props(new LibraryActor())

}

class LibraryActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  val configLibraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  var additionalLibraries: List[String] = List.empty

  def receive: Receive = {

    case GetLibraries => sender ! Libraries(configLibraries ++ additionalLibraries)

    case AddLibrary(library) =>
      if ((configLibraries ++ additionalLibraries).contains(library)) {
        sender() ! LibraryAdditionFailed(s"'$library' is already a library folder")
      } else {
        val file = new File(library)
        // TODO manage exception, e.g. read access denied
        if (file.isDirectory) {
          additionalLibraries +:= file.toString
          sender() ! LibraryAdditionSuccess
        } else {
          sender() ! LibraryAdditionFailed(s"'$file' is not a directory")
        }
      }

  }

}
