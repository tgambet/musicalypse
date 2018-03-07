package net.creasource.web

import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import spray.json._

object SocketActor {
  def props(): Props = Props(new SocketActor)
}

/**
  * The Actor that receives socket messages as JsValue objects and can send back messages to the client through its parent.
  */
class SocketActor extends Actor with Stash {

  private val logger = Logging(context.system, this)

  private val client = context.parent

  override def receive: Receive = {

    case msg: JsValue => client ! msg // or sender() ! msg

  }

}
