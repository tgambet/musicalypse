package net.creasource.audio

case class AudioMetadata(
    source: String,
    title: Option[String],
    artist: Option[String],
    album: Option[String],
    duration: Int)
