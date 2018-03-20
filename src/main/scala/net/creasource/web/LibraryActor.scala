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
  case class RemoveLibrary(library: String)
  sealed trait LibraryChangeResult
  case object LibraryChangeSuccess extends LibraryChangeResult
  case class LibraryChangeFailed(reason: String) extends LibraryChangeResult


  def props()(implicit application: Application): Props = Props(new LibraryActor())

}

class LibraryActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  var libraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  def receive: Receive = {

    case GetLibraries => sender ! Libraries(libraries)

    case AddLibrary(library) =>
      if (libraries.contains(library)) {
        sender() ! LibraryChangeFailed(s"'$library' is already a library folder")
      } else {
        val file = new File(library)
        // TODO manage exception, e.g. read access denied
        if (file.isDirectory) {
          libraries +:= file.toString
          sender() ! LibraryChangeSuccess
        } else {
          sender() ! LibraryChangeFailed(s"'$file' is not a directory")
        }
      }

    case RemoveLibrary(library) =>
      if (libraries.contains(library)) {
        libraries = libraries diff List(library)
        sender() ! LibraryChangeSuccess
      } else {
        sender() ! LibraryChangeFailed(s"$library is not a known library folder.")
      }

  }

}
