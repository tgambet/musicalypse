package net.creasource.web

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.settings.RoutingSettings
import akka.pattern.ask
import net.creasource.audio.Track
import net.creasource.core.Application
import net.creasource.web.LibraryActor._
import net.creasource.web.SettingsActor.{DeleteCovers, GetHost}
import spray.json.DefaultJsonProtocol._
import spray.json.{JsString, JsValue, _}

import scala.collection.immutable.Seq
import scala.concurrent.duration._

class APIRoutes(application: Application) {

  implicit val routingSettings: RoutingSettings = RoutingSettings.apply(application.config)

  val askTimeout: akka.util.Timeout = 10.seconds

/*  val uploadFolder: String = application.config.getString("music.uploadFolder")

  val uploadFolderFile = new File(uploadFolder)

  if(!uploadFolderFile.exists()) {
    uploadFolderFile.mkdirs()
  }

  if (!uploadFolderFile.isDirectory) {
    throw new IllegalArgumentException(s"Config music.uploadFolder ($uploadFolder) is not a folder!")
  }*/

  def librariesRoutes: Route =
    pathPrefix("libraries") {
      path("tracks") {
        encodeResponse {
          get {
            onSuccess((application.libraryActor ? GetTracks) (askTimeout).mapTo[Seq[Track]]) {
              tracks => complete(StatusCodes.OK, tracks.toJson)
            }
          }
        }
      } ~
      pathEndOrSingleSlash {
        get {
          onSuccess((application.libraryActor ? GetLibraries)(askTimeout).mapTo[Libraries]) {
            case Libraries(libraries) => complete(libraries.map(_.toString))
          }
        } ~
        post {
          entity(as[JsValue]) { json =>
            val lib = json.convertTo[String]
            onSuccess((application.libraryActor ? AddLibrary(lib))(askTimeout).mapTo[LibraryChangeResult]) {
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

/*  def uploadDestination(fileInfo: FileInfo): File = {
    new File(s"$uploadFolder/${fileInfo.fileName}")
  }*/

  // TODO accept ogg and flac
/*  def filesUpload: Route =
    path("upload") {
      withSizeLimit(20000000) {
        storeUploadedFile("file", uploadDestination) { (metadata, file) =>
          if (metadata.contentType.mediaType == MediaTypes.`audio/mpeg` || metadata.contentType.toString() == "audio/mp3") {
            complete(StatusCodes.OK, "")
          } else {
            file.delete()
            complete(StatusCodes.NotAcceptable, "")
          }
        }
      }
    }*/

  def settingsRoutes: Route =
    path("host") {
      get {
        onSuccess((application.settingsActor ? GetHost)(askTimeout).mapTo[String]) {
          host => complete(StatusCodes.OK, host.toJson)
        }
      }
    } ~
    path("covers") {
      delete {
        onSuccess((application.settingsActor ? DeleteCovers)(askTimeout).mapTo[String]) {
          ok => complete(StatusCodes.OK, ok.toJson)
        }
      }
    }


  def routes: Route = {
    pathPrefix("api") {
      respondWithHeader(RawHeader("Access-Control-Allow-Origin", "*")) {
        Route.seal(concat(
          librariesRoutes,
          // filesUpload,
          settingsRoutes,
          pathEndOrSingleSlash {
            options {
              val corsHeaders: Seq[HttpHeader] = Seq(
                RawHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"),
                RawHeader("Access-Control-Allow-Headers", "Content-Type")
              )
              respondWithHeaders(corsHeaders) {
                complete(StatusCodes.OK, "")
              }
            }
          }
        ))
      }
    }
  }

}
