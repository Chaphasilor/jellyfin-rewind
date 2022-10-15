export class PrimaryImage {
  constructor ({ parentItemId, primaryTag, blurhash }) {
    this.parentItemId = parentItemId
    this.primaryTag = primaryTag
    this.blurhash = blurhash
  }
  getUrl(baseUrl, dimensions = 160, quality = 90) {
    return `${baseUrl}/Items/${this.parentItemId}/Images/Primary?fillWidth=${dimensions}&fillHeight=${dimensions}&tag=${this.primaryTag}&quality=${quality}`
  }
}

export class Artist {
  constructor({ id, name, tracks, image, playCount, lastPlayed, totalPlayDuration }) {
    this.name = name
    this.id = id
    this.tracks = tracks
    this.image = image
    this.playCount = playCount
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
  }
}

export class Album {
  constructor({ id, name, artists, albumArtist, tracks, year, image, playCount, lastPlayed, totalPlayDuration }) {
    this.name = name
    this.id = id
    this.artists = artists
    this.albumArtist = albumArtist
    this.tracks = tracks
    this.year = year
    this.image = image
    this.playCount = playCount
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
  }
}

export class Track {
  constructor({ name, id, artistsBaseInfo, albumArtistBaseInfo, albumBaseInfo, image, year, duration, playCount, lastPlayed, totalPlayDuration, isFavorite }) {
    this.name = name
    this.id = id
    this.artistsBaseInfo = artistsBaseInfo
    this.albumBaseInfo = albumBaseInfo
    this.image = image
    this.year = year
    this.duration = duration
    this.playCount = playCount
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
    this.isFavorite = isFavorite
  }

  get albumArtist() {
    return this.albumBaseInfo.albumArtistBaseInfo
  }
}
