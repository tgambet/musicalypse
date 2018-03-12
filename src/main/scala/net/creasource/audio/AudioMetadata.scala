package net.creasource.audio

import spray.json._

case class AudioMetadata(
    location: String,
    title: Option[String],
    artist: Option[String],
    album: Option[String],
    duration: Int)

object AudioMetadata extends DefaultJsonProtocol {
  implicit val formatter: RootJsonFormat[AudioMetadata] = jsonFormat5(AudioMetadata.apply)
}

case class Track(
    url: String,
    metadata: AudioMetadata)

object Track extends DefaultJsonProtocol {
  implicit val formatter: RootJsonFormat[Track] = jsonFormat2(Track.apply)
}