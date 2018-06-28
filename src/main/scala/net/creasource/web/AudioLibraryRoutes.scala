package net.creasource.web

import java.io.File

import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.settings.RoutingSettings
import akka.pattern.ask
import net.creasource.core.Application
import net.creasource.web.LibraryActor.{GetLibraries, Libraries}

import scala.concurrent.duration._

class AudioLibraryRoutes(application: Application) {

  implicit val settings: RoutingSettings = RoutingSettings.apply(application.config)

  implicit val askTimeout: akka.util.Timeout = 2.seconds

  var cacheFolder: String = application.config.getString("music.cacheFolder")

  // val uploadFolder: String = application.config.getString("music.uploadFolder")

  val cacheFolderFile = new File(cacheFolder)

  if(!cacheFolderFile.exists()) {
    cacheFolderFile.mkdirs()
  }

  if (!cacheFolderFile.isDirectory) {
    throw new IllegalArgumentException(s"Config music.cacheFolder ($cacheFolder) is not a folder!")
  }

  def routes: Route =
    pathPrefix("music") {
      onSuccess((application.libraryActor ? GetLibraries).mapTo[Libraries]) { libraries =>
        //val libs = libraries.libraries.map(_.toString) +: uploadFolder
        val libs = libraries.libraries.map(_.toString)
        Route.seal(libs.map(getFromBrowseableDirectory).fold(reject())(_ ~ _))
      }
    } ~ pathPrefix("cache") {
      respondWithHeader(RawHeader("Cache-Control", "max-age=604800")) {
        encodeResponse {
          getFromBrowseableDirectory(cacheFolder)
        }
      }
    }

}
