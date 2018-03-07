package net.creasource.http

import akka.actor.{ActorRef, Props, Status}
import akka.http.scaladsl.model.ws.{Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.pattern.ask
import akka.stream.{KillSwitches, OverflowStrategy, SharedKillSwitch}
import akka.stream.scaladsl.{Flow, Keep, Sink, Source}

import scala.concurrent.Future
import scala.concurrent.duration._

import net.creasource.http.actors.{SocketSinkActor, SocketSinkSupervisor}

/**
  * A WebServer that supports WebSockets connections on the path /socket.
  * Concrete classes must define a socketActorProps that will receive socket messages.
  */
trait SocketWebServer extends WebServer { self: WebServer =>

  protected val socketActorProps: Props
  protected val keepAliveMessage: Option[TextMessage] = Some(TextMessage("""{"method":"keepAlive"}"""))
  protected val keepAliveTimeout: FiniteDuration = 1.minute

  private lazy val sinkActorProps: Props = SocketSinkActor.props(socketActorProps)
  private lazy val socketsKillSwitch: SharedKillSwitch = KillSwitches.shared("sockets")
  private lazy val supervisor = system.actorOf(SocketSinkSupervisor.props(), "sockets")

  def socketFlow(sinkActor: ActorRef): Flow[Message, Message, Unit] = {
    val flow: Flow[Message, Message, ActorRef] =
      Flow.fromSinkAndSourceMat(
        Sink.actorRef(sinkActor, Status.Success(())),
        Source.actorRef(1000, OverflowStrategy.fail)
      )(Keep.right)

    val flow2: Flow[Message, Message, Unit] = flow.mapMaterializedValue(sourceActor => sinkActor ! sourceActor)

    keepAliveMessage match {
      case Some(message) => flow2.keepAlive(keepAliveTimeout, () => message)
      case None          => flow2
    }
  }

  override def stop(): Future[Unit] = {
    system.log.info("Killing open sockets.")
    socketsKillSwitch.shutdown()
    super.stop()
  }

  override def routes: Route =
    path("socket") {
      extractUpgradeToWebSocket { _ =>
        onSuccess((supervisor ? sinkActorProps)(1.second).mapTo[ActorRef]) { sinkActor: ActorRef =>
          handleWebSocketMessages(socketFlow(sinkActor).via(socketsKillSwitch.flow))
        }
      }
    } ~ super.routes

}
