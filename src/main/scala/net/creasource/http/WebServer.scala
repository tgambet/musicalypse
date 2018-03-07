package net.creasource.http

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server._
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.RouteResult.route2HandlerFlow
import akka.stream.ActorMaterializer

import scala.concurrent.{ExecutionContext, Future}

/**
  * A Simple WebServer trait that uses akka-http API.
  */
trait WebServer {

  implicit val system: ActorSystem

  implicit lazy val materializer: ActorMaterializer = ActorMaterializer()

  implicit protected lazy val dispatcher: ExecutionContext = system.dispatcher

  private var bindingFuture: Future[Http.ServerBinding] = _

  def routes: Route = reject

  def start(host: String, port: Int): Future[Unit] = {
    bindingFuture = Http().bindAndHandle(route2HandlerFlow(routes), host, port)
    bindingFuture.failed.foreach { ex =>
      system.log.error(ex, "Failed to bind to {}:{}!", host, port)
    }
    bindingFuture map { _ =>
      system.log.info("Server online at http://{}:{}/", host, port)
    }
  }

  def stop(): Future[Unit] = {
    require(bindingFuture != null, "No binding found. Have you called start() before?")
    system.log.info("Unbinding.")
    bindingFuture.flatMap(_.unbind())
  }

}



