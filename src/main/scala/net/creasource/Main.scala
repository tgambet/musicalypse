package net.creasource

import akka.actor.{ActorSystem, Props}
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._

import scala.io.StdIn
import net.creasource.core.Application
import net.creasource.web._
import net.creasource.http.{SPAWebServer, SocketWebServer}

import scala.concurrent.duration._

/**
  * The Main class that bootstraps the application.
  */
object Main extends App with SPAWebServer with SocketWebServer {

  implicit val app: Application = Application()

  private val host = app.config.getString("http.host")
  private val port = app.config.getInt("http.port")
  private val stopOnReturn = app.config.getBoolean("http.stop-on-return")
  private val keepAliveInSec = app.config.getInt("http.webSocket.keep-alive")

  private val apiRoutes = new APIRoutes(app)

  override implicit val system: ActorSystem = app.system
  override val socketActorProps: Props = SocketActor.props()
  override val keepAliveTimeout: FiniteDuration = keepAliveInSec.seconds
  override val routes: Route = apiRoutes.routes ~ super.routes

  start(host, port) foreach { _ =>
    if (stopOnReturn) {
      system.log.info(s"Press RETURN to stop...")
      StdIn.readLine()
      stop().onComplete(_ => app.shutdown())
    }
  }

}
