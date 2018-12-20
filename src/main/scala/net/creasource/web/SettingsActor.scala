package net.creasource.web

import java.net.NetworkInterface
import java.nio.file.{Files, Path, Paths}

import akka.Done
import akka.actor.{Actor, Props}
import akka.event.Logging
import net.creasource.core.Application
import net.creasource.web.SettingsActor.{DeleteCovers, GetHostIps}

import scala.collection.JavaConverters._

object SettingsActor {

  case object GetHostIps
  case object DeleteCovers

  def props()(implicit application: Application): Props = Props(new SettingsActor())

}

class SettingsActor()(implicit application: Application) extends Actor with JsonSupport {

  private val logger = Logging(context.system, this)

  val cacheFolder: Path = Paths.get(application.config.getString("music.cacheFolder"))

  override def receive: Receive = {

    case GetHostIps =>
      val interfaces: Seq[NetworkInterface] = java.net.NetworkInterface.getNetworkInterfaces.asScala.toSeq
      val ipAddresses: Seq[String] =
        interfaces.flatMap { p =>
          logger.debug("Found interface: " + p.getDisplayName)
          p.getInetAddresses.asScala.toSeq
        }.collect { case address if !address.isLoopbackAddress && address.getHostAddress.contains(".") =>
          logger.debug("Found address: " + address.getHostAddress)
          address.getHostAddress
        }
      sender() ! ipAddresses

    case DeleteCovers =>
      logger.info("Deleting covers")
      val covers = cacheFolder.resolve("covers")
      Files.walk(covers)
        .filter(path => path != covers)
        .forEach(path => path.toFile.delete())
      sender() ! Done

  }

}
