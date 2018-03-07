package net.creasource.http.actors

import akka.actor.{Actor, ActorRef, OneForOneStrategy, Props, Stash, Status, SupervisorStrategy, Terminated}
import akka.event.Logging
import akka.http.scaladsl.model.ws.{BinaryMessage, TextMessage}
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.Sink

import spray.json._

import scala.concurrent.duration._

object SocketSinkActor {
  def props(socketActorProps: Props)(implicit materializer: ActorMaterializer): Props = Props(new SocketSinkActor(socketActorProps))
}

class SocketSinkActor(socketActorProps: Props)(implicit materializer: ActorMaterializer) extends Actor with Stash {
  private val logger = Logging(context.system, this)

  logger.info("Socket opened. Actor created.")

  override def receive: Receive = {
    case sourceActor: ActorRef =>
      val user = context.watch(context.actorOf(socketActorProps, "user"))
      unstashAll()
      context.become {
        case TextMessage.Strict(data)        => user ! JsonParser(data)
        case BinaryMessage.Strict(_)         => // ignore
        case TextMessage.Streamed(stream)    => stream.runWith(Sink.ignore)
        case BinaryMessage.Streamed(stream)  => stream.runWith(Sink.ignore)
        case msg: JsValue if sender() == user => sourceActor ! TextMessage(msg.compactPrint)
        case Terminated(`user`) =>
          logger.info("UserActor terminated. Terminating.")
          sourceActor ! Status.Success(())
          context.stop(self)
        case s @ Status.Success(_) =>
          logger.info("Socket closed. Terminating.")
          sourceActor ! s
          context.stop(self)
        case f @ Status.Failure(cause) =>
          logger.error(cause, "Socket failed. Terminating.")
          sourceActor ! f
          context.stop(self)
        case m => logger.warning("Unsupported message: {}", m.toString)
      }
    case _ => stash()
  }

  override val supervisorStrategy: OneForOneStrategy =
    OneForOneStrategy(maxNrOfRetries = 5, withinTimeRange = 1.minute, loggingEnabled = true) {
      case _: Exception => SupervisorStrategy.Stop
    }

  override def postStop(): Unit = {
    logger.info("SocketActor killed")
    super.postStop()
  }

}