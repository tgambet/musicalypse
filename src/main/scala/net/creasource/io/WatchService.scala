package net.creasource.io

/**
  * This file is copy/pasted from https://github.com/nurkiewicz/learning-akka
  * It is released under the Apache 2 License (https://github.com/nurkiewicz/learning-akka/blob/master/license.txt)
  * Substantial modifications have been made, including changing the package name, and fixing the code for fast copy.
  */

import java.nio.file.StandardWatchEventKinds._
import java.nio.file._

import akka.actor.ActorRef
import akka.event.LoggingAdapter

import scala.collection.JavaConverters._

class WatchService(notifyActor: ActorRef, logger: LoggingAdapter) extends Runnable {
  private val watchService = FileSystems.getDefault.newWatchService()

  def watch(root: Path) {
    logger.info("Watching folder: " + root)
    register(root)
    Files.walk(root, 1).forEach(path =>
      if (path.toFile.isDirectory && path != root) {
        watch(path)
      } else if (!path.toFile.isDirectory) {
        // Ugly hack to wait for the file to be unlocked
        while (path.toFile.exists() && !path.toFile.renameTo(path.toFile)) {
          Thread.sleep(100)
        }
        notifyActor ! Created(path.toFile)
        logger.debug("Entry created: " + path)
      }
    )
  }

  private def register(path: Path): WatchKey = path.register(watchService, ENTRY_CREATE, ENTRY_DELETE)

  def run() {
    try {
      logger.debug("Waiting for file system events...")
      while (!Thread.currentThread().isInterrupted) {
        val key = watchService.take()
        key.pollEvents().asScala foreach {
          event =>
            val relativePath = event.context().asInstanceOf[Path]
            val path = key.watchable().asInstanceOf[Path].resolve(relativePath)
            event.kind() match {
              case ENTRY_CREATE =>
                if (path.toFile.isDirectory) {
                  watch(path)
                } else {
                  // Ugly hack to wait for the file to be unlocked
                  while (path.toFile.exists() && !path.toFile.renameTo(path.toFile)) {
                    Thread.sleep(100)
                  }
                  notifyActor ! Created(path.toFile)
                  logger.debug("Entry created: " + path)
                }

              case ENTRY_DELETE =>
                notifyActor ! Deleted(path.toFile)
                logger.debug("Entry deleted: " + path)

              case e =>
                logger.warning("Unknown event received: " + e.toString)
            }
        }
        key.reset()
      }
    } catch {
      case _: InterruptedException => logger.debug("Interrupted.")
    } finally {
      watchService.close()
    }
  }
}
