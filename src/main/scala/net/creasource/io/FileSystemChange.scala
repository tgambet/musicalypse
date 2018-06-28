package net.creasource.io

import java.nio.file.Path

object FileSystemChange {

  sealed trait FileSystemChange {
    def path: Path
  }

  case class Created(path: Path) extends FileSystemChange

  case class Deleted(path: Path) extends FileSystemChange

  case class WatchDir(path: Path)

}
