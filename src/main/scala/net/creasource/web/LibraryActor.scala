package net.creasource.web

import java.io.File

import akka.actor.{Actor, Props, Stash}
import net.creasource.core.Application
import net.creasource.web.LibraryActor._

import scala.collection.JavaConverters._
import scala.util.{Failure, Success, Try}

object LibraryActor {

  case object GetLibraries
  case class Libraries(libraries: List[String])

  case class AddLibrary(library: String)
  sealed trait LibraryAdditionResult
  case object LibraryAdded extends LibraryAdditionResult
  case class LibraryAdditionFailed(reason: String) extends LibraryAdditionResult

  def props()(implicit application: Application): Props = Props(new LibraryActor())

}

class LibraryActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  val configLibraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  var additionalLibraries: List[String] = List.empty

  def receive: Receive = {

    case GetLibraries => sender ! Libraries(configLibraries)

    case AddLibrary(library) => Try(new File(library)) match {
      case Success(file) =>
        if (file.isDirectory) {
          additionalLibraries +:= file.toString
          sender() ! LibraryAdded
        } else {
          sender() ! LibraryAdditionFailed(s"The library $file is not a directory")
        }
      case Failure(reason) => sender() ! LibraryAdditionFailed(s"An error occurred while adding a library: ${reason.getMessage}")
    }

  }

}
