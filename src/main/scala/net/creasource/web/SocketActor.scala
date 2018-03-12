package net.creasource.web

import java.io.File

import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.RouteResult.route2HandlerFlow
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Sink, Source}
import net.creasource.audio.LibraryScanner
import spray.json._

import scala.collection.immutable.Seq
import scala.concurrent.Future

object SocketActor {
  def props(xhrRoutes: Route)(implicit materializer: ActorMaterializer): Props = Props(new SocketActor(xhrRoutes))
}

/**
  * The Actor that receives socket messages as JsValue objects and sends back to the client through its parent.
  *
  * @param xhrRoutes XHR routes that this socket can handle
  * @param materializer An actor materializer
  */
class SocketActor(xhrRoutes: Route)(implicit materializer: ActorMaterializer) extends Actor with Stash with JsonSupport {

  import context.dispatcher

  private val logger = Logging(context.system, this)

  private val client = context.parent

  private val scanner = new LibraryScanner

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

    case JsonMessage("ScanLibrary", _, JsNull) =>
      scanner
        .scanLibrary(new File("D:\\Musique\\Megadeth"))
        .runWith(Sink.foreach(client ! _.toJson))

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

