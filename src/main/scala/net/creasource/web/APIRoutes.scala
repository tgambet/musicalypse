package net.creasource.web

import java.io.File

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.FileInfo
import akka.http.scaladsl.settings.RoutingSettings
import akka.pattern.ask
import net.creasource.core.Application
import net.creasource.web.LibraryActor._
import spray.json.DefaultJsonProtocol._
import spray.json.{JsString, JsValue}

import scala.collection.immutable.Seq
import scala.concurrent.duration._

/**
  * This is where you define your XHR routes.
  *
  * @param application an Application
  */
class APIRoutes(application: Application) {

  implicit val settings: RoutingSettings = RoutingSettings.apply(application.config)

  val askTimeout: akka.util.Timeout = 2.seconds

  val uploadFolder: String = application.config.getString("music.uploadFolder")

  val uploadFolderFile = new File(uploadFolder)

  if(!uploadFolderFile.exists()) {
    uploadFolderFile.mkdirs()
  }

  if (!uploadFolderFile.isDirectory) {
    throw new IllegalArgumentException(s"Config music.uploadFolder ($uploadFolder) is not a folder!")
  }

  def librariesRoutes: Route =
    pathPrefix("libraries") {
      pathEndOrSingleSlash {
        get {
          onSuccess((application.libraryActor ? GetLibraries) (askTimeout).mapTo[Libraries]) {
            case Libraries(libraries) => complete(libraries)
          }
        } ~
        post {
          entity(as[JsValue]) { json =>
            val lib = json.convertTo[String]
            onSuccess((application.libraryActor ? AddLibrary(lib)) (askTimeout).mapTo[LibraryChangeResult]) {
              case LibraryChangeSuccess => complete(StatusCodes.OK, JsString("OK"))
              case LibraryChangeFailed(reason) => complete(StatusCodes.BadRequest, reason)
            }
          }
        }
      } ~
      path(Segment) { lib =>
        delete {
          onSuccess((application.libraryActor ? RemoveLibrary(lib))(askTimeout).mapTo[LibraryChangeResult]) {
            case LibraryChangeSuccess => complete(StatusCodes.OK, JsString("OK"))
            case LibraryChangeFailed(reason) => complete(StatusCodes.BadRequest, reason)
          }
        }
      }
    }

  def uploadDestination(fileInfo: FileInfo): File = {
    new File(s"$uploadFolder/${fileInfo.fileName}")
  }

  def filesUpload: Route =
    path("upload") {
      withSizeLimit(20000000) {
        storeUploadedFile("file", uploadDestination) { (metadata, file) =>
          if (metadata.contentType.toString() != "audio/mp3") {
            file.delete()
            complete(StatusCodes.NotAcceptable, "")
          } else {
            complete(StatusCodes.OK, "")
          }
        }
      }
    }


  def routes: Route = {
    pathPrefix("api") {
      respondWithHeader(RawHeader("Access-Control-Allow-Origin", "*")) {
        Route.seal(concat(
          librariesRoutes,
          filesUpload,
          options {
            val corsHeaders: Seq[HttpHeader] = Seq(
              RawHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"),
              RawHeader("Access-Control-Allow-Headers", "Content-Type")
            )
            respondWithHeaders(corsHeaders) {
              complete(StatusCodes.OK, "")
            }
          }
        ))
      }
    }
  }

}
