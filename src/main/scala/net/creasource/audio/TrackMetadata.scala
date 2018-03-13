package net.creasource.audio

import spray.json._
import spray.json.DefaultJsonProtocol._

case class TrackMetadata(
    location: String,
    title: Option[String],
    artist: Option[String],
    album: Option[String],
    duration: Int)

object TrackMetadata {
  implicit val formatter: RootJsonFormat[TrackMetadata] = jsonFormat5(TrackMetadata.apply)
}

case class Track(
    url: String,
    metadata: TrackMetadata)

object Track {
  implicit val formatter: RootJsonFormat[Track] = jsonFormat2(Track.apply)
}