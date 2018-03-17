package net.creasource.web

import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import net.creasource.core.Application
import scala.collection.JavaConverters._

class AudioLibraryRoutes(application: Application) {

  val configLibraries: List[String] = application.config.getStringList("music.libraries").asScala.toList

  def routes: Route =
    pathPrefix("music") {
      //onSuccess(application.libraryActor ? GetLibraries) { libraries =>
      configLibraries.map(getFromBrowseableDirectory).fold(reject())(_ ~ _)
    }

}
