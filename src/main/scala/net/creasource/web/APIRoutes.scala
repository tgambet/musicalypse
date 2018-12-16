package net.creasource.web

import akka.http.scaladsl.Http
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.headers.{Location, RawHeader}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.settings.RoutingSettings
import akka.pattern.ask
import akka.util.ByteString
import net.creasource.core.Application
import net.creasource.model.Track
import net.creasource.web.LibraryActor._
import net.creasource.web.LyricsActor._
import net.creasource.web.SettingsActor.{DeleteCovers, GetHostIps}
import spray.json.DefaultJsonProtocol._
import spray.json.{JsString, JsValue, _}

import scala.collection.immutable.Seq
import scala.concurrent.duration._

class APIRoutes(application: Application) {

  implicit val routingSettings: RoutingSettings = RoutingSettings.apply(application.config)

  val askTimeout: akka.util.Timeout = 10.seconds

  import application.{materializer, system}
  import application.system.dispatcher

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
        onSuccess((application.settingsActor ? GetHostIps)(askTimeout).mapTo[Seq[String]]) {
          ips => complete(StatusCodes.OK, ips.toJson)
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

  case class Lyrics(lyrics: String)
  implicit val lyricsFormat: RootJsonFormat[Lyrics] = jsonFormat1(Lyrics.apply)

  def lyricsRoutes: Route =
    pathPrefix("lyrics") {
      path(Segments(2)) { case List(artist, title) =>
        get {
          onSuccess((application.lyricsActor ? GetLyrics(artist, title)) (askTimeout).mapTo[GetLyricsResult]) {
            case LyricsFound(lyrics) => complete(StatusCodes.OK, Lyrics(lyrics).toJson)
            case LyricsNotFound => complete(StatusCodes.NotFound, "Lyrics not found")
          }
        } ~
        post {
          entity(as[Lyrics]) { lyrics =>
            onSuccess((application.lyricsActor ? SaveLyrics(lyrics.lyrics, artist, title)) (askTimeout).mapTo[SaveLyricsResult]) {
              case LyricsSaved => complete(StatusCodes.OK, "Lyrics saved".toJson)
              case LyricsSaveError(error) => complete(StatusCodes.InternalServerError, error)
            }
          }
        }
      }
    }

  val client = Http()

  def proxyRoutes: Route =
    pathPrefix("proxy") {
      path(Segment) { uri =>
        val reqHeaders = Seq(
          headers.Accept(MediaRanges.`text/*`),
          // headers.`User-Agent`("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"),
        )
        def request(uri: Uri) = HttpRequest(uri = uri, method = HttpMethods.GET, headers = reqHeaders)
        def responseToDirective(response: HttpResponse) = {
          response.status match {
            case StatusCodes.OK =>
              onSuccess(response.entity.dataBytes.runFold(ByteString(""))(_ ++ _).map { body =>
                body.utf8String
              }) {
                body => complete(StatusCodes.OK, body)
              }
            case _ =>
              response.discardEntityBytes()
              complete(StatusCodes.NotFound)
          }
        }
        onSuccess(client.singleRequest(request(uri))) { response =>
          response.status match {
            case StatusCodes.MovedPermanently | StatusCodes.Found | StatusCodes.SeeOther =>
              response.discardEntityBytes()
              val newResp = client.singleRequest(request(response.header[Location].get.uri))
              onSuccess(newResp)(responseToDirective)
            case _ => responseToDirective(response)
          }
        }
      }
    }


  def routes: Route = {
    pathPrefix("api") {
      respondWithHeaders(RawHeader("Access-Control-Allow-Origin", "*")) {
        Route.seal(concat(
          options {
            val corsHeaders: Seq[HttpHeader] = Seq(
              RawHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"),
              RawHeader("Access-Control-Allow-Headers", "Content-Type")
            )
            respondWithHeaders(corsHeaders) {
              complete(StatusCodes.OK, "")
            }
          },
          librariesRoutes,
          settingsRoutes,
          lyricsRoutes,
          proxyRoutes
        ))
      }
    }
  }

}
