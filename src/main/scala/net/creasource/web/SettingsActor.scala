package net.creasource.web

import java.net.InetAddress

import akka.actor.{Actor, Props, Stash}
import net.creasource.core.Application
import net.creasource.web.SettingsActor.GetHost

object SettingsActor {

  case object GetHost

  def props()(implicit application: Application): Props = Props(new SettingsActor())

}

class SettingsActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  override def receive: Receive = {
    case GetHost => sender() ! InetAddress.getLocalHost.getHostAddress
  }

}
