package net.creasource.web

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.settings.RoutingSettings
import net.creasource.core.Application

import scala.collection.JavaConverters._

class AudioLibraryRoutes(application: Application) {

  val configLibraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  implicit val settings: RoutingSettings = RoutingSettings.apply(application.config)

  def routes: Route =
    pathPrefix("music") {
      //onSuccess(application.libraryActor ? GetLibraries) { libraries =>
      Route.seal(configLibraries.map(getFromBrowseableDirectory).fold(reject())(_ ~ _))
    }

}
