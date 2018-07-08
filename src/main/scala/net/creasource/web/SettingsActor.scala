package net.creasource.web

import java.nio.file.{Files, Path, Paths}

import akka.actor.{Actor, Props, Stash}
import akka.event.Logging
import net.creasource.core.Application
import net.creasource.web.SettingsActor.{DeleteCovers, GetHostIps}

object SettingsActor {

  case object GetHostIps
  case object DeleteCovers

  def props()(implicit application: Application): Props = Props(new SettingsActor())

}

class SettingsActor()(implicit application: Application) extends Actor with Stash with JsonSupport {

  private val logger = Logging(context.system, this)

  val cacheFolder: Path = Paths.get(application.config.getString("music.cacheFolder"))

  override def receive: Receive = {

    case GetHostIps =>
      var ipAddresses = Seq.empty[String]
      try {
        val interfaces = java.net.NetworkInterface.getNetworkInterfaces
        while (interfaces.hasMoreElements) {
          val ips = interfaces.nextElement.getInetAddresses
          while (ips.hasMoreElements) {
            val ip = ips.nextElement.getHostAddress
            if (ip.matches("([0-9]+.)+"))
              ipAddresses +:= ip
          }
        }
      } catch {
        case _: Throwable => logger.error("Error retrieving network interface list")
      }
      sender() ! ipAddresses

    case DeleteCovers =>
      logger.info("Deleting covers")
      val covers = cacheFolder.resolve("covers")
      Files.walk(covers)
        .filter(path => path != covers)
        .forEach(path => path.toFile.delete())
      sender() ! "OK"

  }

}
