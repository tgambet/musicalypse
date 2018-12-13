package net.creasource.model

import java.nio.file.Path

case class TrackMetadata(
                          location: Path,
                          title: Option[String],
                          artist: Option[String],
                          albumArtist: Option[String],
                          album: Option[String],
                          year: Option[String],
                          duration: Int,
                          cover: Option[AlbumCover])
