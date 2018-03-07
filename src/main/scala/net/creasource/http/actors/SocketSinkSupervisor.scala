package net.creasource.http.actors

import akka.actor.{Actor, OneForOneStrategy, Props, SupervisorStrategy}
import akka.event.Logging
import spray.json.JsonParser.ParsingException

import scala.util.control.NonFatal

object SocketSinkSupervisor {
  def props(): Props = Props(new SocketSinkSupervisor)
}

class SocketSinkSupervisor extends Actor {

  private val logger = Logging(context.system, this)

  override def receive: Receive = {
    case props: Props => sender() ! context.actorOf(props)
  }

  override val supervisorStrategy: OneForOneStrategy =
    OneForOneStrategy(loggingEnabled = true) {
      case p: ParsingException =>
        logger.error(p, "Sent message was not a correct json message. Resuming.")
        SupervisorStrategy.Resume
      case NonFatal(e) =>
        logger.error(e, "An Exception occurred in a SocketSinkActor. Terminating actor.")
        SupervisorStrategy.Stop
      case _ => SupervisorStrategy.Escalate
    }
}
