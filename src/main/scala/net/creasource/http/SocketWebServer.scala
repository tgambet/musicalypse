package net.creasource.http

import akka.Done
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

  private lazy val sinkActorProps: Props = SocketSinkActor.props(socketActorProps)
  private lazy val socketsKillSwitch: SharedKillSwitch = KillSwitches.shared("sockets")
  private lazy val supervisor = system.actorOf(SocketSinkSupervisor.props(), "sockets")

  def socketFlow(sinkActor: ActorRef): Flow[Message, Message, Unit] = {
    Flow.fromSinkAndSourceMat(
      Sink.actorRef(sinkActor, Status.Success(())),
      Source.actorRef(1000, OverflowStrategy.fail)
    )(Keep.right).mapMaterializedValue(sourceActor => sinkActor ! sourceActor)
  }

  override def stop(): Future[Done] = {
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
