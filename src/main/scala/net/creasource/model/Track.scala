package net.creasource.model

import spray.json.DefaultJsonProtocol._
import spray.json._

case class Track(
                  url: String,
                  coverUrl: Option[String],
                  location: String,
                  title: Option[String],
                  artist: Option[String],
                  albumArtist: Option[String],
                  album: Option[String],
                  year: Option[String],
                  duration: Int)

object Track {
  implicit val formatter: RootJsonFormat[Track] = jsonFormat9(Track.apply)
}
