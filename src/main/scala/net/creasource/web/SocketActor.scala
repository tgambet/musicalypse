package net.creasource.web

import java.io.File

import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.RouteResult.route2HandlerFlow
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source}
import net.creasource.audio.{TrackMetadata, LibraryScanner, Track}
import net.creasource.core.Application
import spray.json._

import scala.collection.immutable.Seq
import scala.collection.JavaConverters._
import scala.concurrent.Future

object SocketActor {
  def props(xhrRoutes: Route)(implicit materializer: ActorMaterializer, app: Application): Props = Props(new SocketActor(xhrRoutes))
}

/**
  * The Actor that receives socket messages as JsValue objects and sends back to the client through its parent.
  *
  * @param xhrRoutes XHR routes that this socket can handle
  * @param materializer An actor materializer
  */
class SocketActor(xhrRoutes: Route)(implicit materializer: ActorMaterializer, app: Application) extends Actor with Stash with JsonSupport {

  import context.dispatcher

  private val logger = Logging(context.system, this)

  private val client = context.parent

  val audioLibraries: List[String] = app.config.getStringList("music.libraries").asScala.toList

  override def receive: Receive = {

    case value: JsValue =>
      handleMessages.applyOrElse(value, (v: JsValue) => logger.warning("Unhandled Json message:\n{}", v.prettyPrint))

    case value =>
      logger.error("UserActor should only receive Json Messages: {}", value.toString)

  }

  def handleMessages: PartialFunction[JsValue, Unit] = {

    case JsonMessage("HttpRequest", id, entity) =>
      toHttpResponse(entity.convertTo[HttpRequest]) foreach { response =>
        client ! JsonMessage("HttpResponse", id, response.toJson).toJson
      }

    case JsonMessage("ScanLibrary", id, _) =>
      logger.info("scanning libraries")
      audioLibraries
          // get a scanner per library
          .map(s => new LibraryScanner(new File(s)))
          // scan
          .map(s => s.scanLibrary()
            // create a track per metadata
            .map(metadata => Track(
              url = getUrlFromAudioMetadata(metadata, s.libraryFolder),
              metadata = metadata
            ))
            // encapsulate the track into a JsonMessage
            .map(track => JsonMessage(
              method = "TrackAdded",
              id = id,
              entity = track.toJson
            ).toJson))
          // reduce to a single source
          .reduce(_ concat _)
          // stream to client
          .runWith(Sink.foreach(client ! _))
          // send completion acknowledgment
          .onComplete(_ => {
            client ! JsonMessage(
              method = "LibraryScanned",
              id = id,
              entity = JsNull
            ).toJson
          })

    case a @ JsonMessage(_, _, _) =>
      logger.info("test")
      client ! a

    case str: JsString =>
      logger.info("test2")
      client ! str

    case obj: JsObject =>
      logger.info("test3")
      client ! obj

  }

  private def getUrlFromAudioMetadata(metadata: TrackMetadata, libraryFolder: File): String = {
    "/music/" + libraryFolder.toPath.relativize(new File(metadata.location).toPath).toString.replaceAll("""\\""", "/")
  }

  val toHttpResponse: HttpRequest => Future[HttpResponse] = route2Response(xhrRoutes)

  def route2Response(route: Route)(implicit materializer: ActorMaterializer): HttpRequest => Future[HttpResponse] =
    (request) => route2HandlerFlow(route).runWith(Source[HttpRequest](Seq(request)), Sink.head)._2

}

