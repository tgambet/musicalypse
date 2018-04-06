package net.creasource.web

import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.RouteResult.route2HandlerFlow
import akka.pattern.ask
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source}
import akka.{Done, NotUsed}
import net.creasource.audio.Track
import net.creasource.core.Application
import net.creasource.web.LibraryActor._
import spray.json._

import scala.collection.JavaConverters._
import scala.collection.immutable.Seq
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.{Failure, Success}

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

  val askTimeout: akka.util.Timeout = 2.seconds

  override def receive: Receive = {

    case value: JsValue =>
      handleMessages.applyOrElse(value, (v: JsValue) => logger.warning("Unhandled Json message:\n{}", v.prettyPrint))

    case value =>
      logger.error("SocketActor should only receive Json Messages: {}", value.toString)

  }

  def handleMessages: PartialFunction[JsValue, Unit] = {

    case JsonMessage("HttpRequest", id, entity) =>
      toHttpResponse(entity.convertTo[HttpRequest]) foreach { response =>
        client ! JsonMessage("HttpResponse", id, response.toJson).toJson
      }

    case JsonMessage("ScanLibrary", id, _) =>
      logger.info("Scanning library")
      val scanFuture: Future[Done] = for {
        f1 <- (app.libraryActor ? ScanLibrary)(askTimeout)
                .mapTo[Source[Track, NotUsed]]
                .map(_.map(track => JsonMessage("TrackAdded", id, track.toJson).toJson))
        f2 <- f1.watch(self).runWith(Sink.foreach(client ! _))
      } yield f2
      scanFuture onComplete {
        case Success(Done) =>
          logger.info("Library scan succeeded")
          client ! JsonMessage("LibraryScanned", id, JsNull).toJson
        case Failure(t)    =>
          logger.error(t, "Library scan failed")
          client ! JsonMessage("LibraryScannedFailed", id, JsString(t.getMessage)).toJson
      }

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

  val toHttpResponse: HttpRequest => Future[HttpResponse] = route2Response(xhrRoutes)

  def route2Response(route: Route)(implicit materializer: ActorMaterializer): HttpRequest => Future[HttpResponse] =
    (request) => route2HandlerFlow(route).runWith(Source[HttpRequest](Seq(request)), Sink.head)._2

}

