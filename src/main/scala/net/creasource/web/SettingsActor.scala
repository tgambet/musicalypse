package net.creasource.web

import java.net.InetAddress
import java.nio.file.{Files, Path, Paths}

import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import net.creasource.core.Application
import net.creasource.web.SettingsActor.{DeleteCovers, GetHost}

object SettingsActor {

  case object GetHost
  case object DeleteCovers

  def props()(implicit application: Application): Props = Props(new SettingsActor())

}

class SettingsActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  private val logger = Logging(context.system, this)

  val cacheFolder: Path = Paths.get(application.config.getString("music.cacheFolder"))

  override def receive: Receive = {

    case GetHost => sender() ! InetAddress.getLocalHost.getHostAddress

    case DeleteCovers =>
      logger.info("Deleting covers")
      val covers = cacheFolder.resolve("covers")
      Files.walk(covers)
        .filter(path => path != covers)
        .forEach(path => path.toFile.delete())
      sender() ! "OK"

  }

}
