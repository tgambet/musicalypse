package net.creasource.io

import java.io.File
import java.nio.file.Path

sealed trait FileSystemChange {
  def file: File
}

case class Created(file: File) extends FileSystemChange

case class Deleted(file: File) extends FileSystemChange

case class WatchDir(path: Path)
