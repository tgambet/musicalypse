package net.creasource.audio

import spray.json._

case class AudioMetadata(
    source: String,
    title: Option[String],
    artist: Option[String],
    album: Option[String],
    duration: Int)

object AudioMetadata extends DefaultJsonProtocol {
  implicit val formatter: RootJsonFormat[AudioMetadata] = jsonFormat5(AudioMetadata.apply)
}
