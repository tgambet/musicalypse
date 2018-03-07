package net.creasource.core

import akka.actor.ActorSystem
import com.typesafe.config.{Config, ConfigFactory}

import scala.concurrent.Await

object Application {

  def apply() = new Application

}

/**
  * Represents an application. This is where you'll instantiate your top actors, connect to a database, etc...
  */
class Application {

  val config: Config = ConfigFactory.load()

  val system: ActorSystem = ActorSystem("MySystem", config)

  system.log.info("Application starting.")

  def shutdown() {
    system.log.info("Shutting down Akka system.")
    import scala.concurrent.duration._
    Await.result(system.terminate(), 5.seconds)
  }

}