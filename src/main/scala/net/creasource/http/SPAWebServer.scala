package net.creasource.http

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.model.headers.RawHeader
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server._

/**
  * A Single Page Application WebServer. Serves files that are found in a resource "web" directory statically and
  * fallbacks to serving index.html when a file is not found.
  */
trait SPAWebServer extends WebServer { self: WebServer =>

  override def routes: Route =
    encodeResponse {
      headerValueByName("Accept") { accept =>
        val serveIndexIfNotFound: RejectionHandler =
          RejectionHandler.newBuilder()
            .handleNotFound {
              if (accept.contains("text/html")) { // || accept.contains("*/*")) {
                respondWithHeader(RawHeader("Cache-Control", "no-cache")) {
                  getFromResource("web/index.html")
                }
              } else {
                complete(StatusCodes.NotFound, "The requested resource could not be found.")
              }
            }
            .result()
        handleRejections(serveIndexIfNotFound) {
          respondWithHeader(RawHeader("Cache-Control", "max-age=86400")) {
            getFromResourceDirectory("web")
          }
        }
      }
    } ~ super.routes

}
