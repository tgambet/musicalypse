package net.creasource.audio

import spray.json._

case class AudioMetadata(
    url: String,
    location: String,
    title: Option[String],
    artist: Option[String],
    album: Option[String],
    duration: Int)

object AudioMetadata extends DefaultJsonProtocol {
  implicit val formatter: RootJsonFormat[AudioMetadata] = jsonFormat6(AudioMetadata.apply)
}
