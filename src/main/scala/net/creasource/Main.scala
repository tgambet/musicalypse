package net.creasource

import akka.actor.{ActorSystem, Props}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import net.creasource.core.Application
import net.creasource.http.{SPAWebServer, SocketWebServer}
import net.creasource.web._

import scala.io.StdIn

/**
  * The Main class that bootstraps the application.
  */
object Main extends App with SPAWebServer with SocketWebServer {

  implicit val app: Application = Application()

  private val host = app.config.getString("http.host")
  private val port = app.config.getInt("http.port")
  private val stopOnReturn = app.config.getBoolean("http.stop-on-return")

  private val apiRoutes = new APIRoutes(app)
  private val libraryRoutes = new AudioLibraryRoutes(app)

  override implicit val system: ActorSystem = app.system
  override val socketActorProps: Props = SocketActor.props(apiRoutes.routes)
  override val routes: Route = libraryRoutes.routes ~ apiRoutes.routes ~ super.routes

  val startFuture = start(host, port)

  startFuture.failed.foreach(t => {
    stop().onComplete(_ => {
      system.log.error(t, "An error occurred while starting the server!")
      app.shutdown()
      System.exit(1)
    })
  })

  startFuture foreach { _ =>
    if (stopOnReturn) {
      system.log.info(s"Press RETURN to stop...")
      StdIn.readLine()
      stop().onComplete(_ => app.shutdown())
    }
  }

}
