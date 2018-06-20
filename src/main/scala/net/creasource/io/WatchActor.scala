package net.creasource.io

import akka.actor.{Actor, Props}
import akka.event.{Logging, LoggingReceive}

/**
  * This file is copy/pasted from https://github.com/nurkiewicz/learning-akka
  * It is released under the Apache 2 License (https://github.com/nurkiewicz/learning-akka/blob/master/license.txt)
  * Some minor modifications have been made, including changing the package name, and adding a companion object.
  */

object WatchActor {
  def props: Props = Props(new WatchActor)
}

class WatchActor extends Actor {
  val log = Logging(context.system, this)
  val watchService = new WatchService(self, log)
  val watchThread = new Thread(watchService, "WatchService")

  override def preStart() {
    watchThread.setDaemon(true)
    watchThread.start()
  }

  override def postStop() {
    watchThread.interrupt()
  }

  def receive = LoggingReceive {
    case WatchDir(path) => watchService watch path
    case change: FileSystemChange => context.parent ! change
  }
}
