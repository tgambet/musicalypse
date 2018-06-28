package net.creasource.io

import akka.actor.{Actor, Props}
import akka.event.{Logging, LoggingReceive}
import akka.stream.Materializer
import net.creasource.io.FileSystemChange.WatchDir

/**
  * This file is copy/pasted from https://github.com/nurkiewicz/learning-akka
  * It is released under the Apache 2 License (https://github.com/nurkiewicz/learning-akka/blob/master/license.txt)
  * Some minor modifications have been made, including changing the package name, and adding a companion object.
  */

object WatchActor {
  def props()(implicit materializer: Materializer): Props = Props(new WatchActor()(materializer))
}

class WatchActor()(implicit materializer: Materializer) extends Actor {

  import context.dispatcher

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

    case WatchDir(path) =>
      val s = sender()
      (watchService watch path).map(s ! _)

    case change: FileSystemChange.FileSystemChange => context.parent ! change

  }
}
