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

export class BackdropImage {
  constructor ({ id, parentItemId, backgroundTag, blurhash }) {
    this.id = id
    this.parentItemId = parentItemId
    this.backgroundTag = backgroundTag
    this.blurhash = blurhash
  }
  getUrl(baseUrl, maxWidth = 2880, quality = 80) {
    return `${baseUrl}/Items/${this.parentItemId}/Images/Backdrop/${this.id}?maxWidth=${maxWidth}&tag=${this.backgroundTag}&quality=${quality}`
  }
}

export class Artist {
  constructor({ id, name, tracks, images, playCount, plays, lastPlayed, totalPlayDuration }) {
    this.name = name
    this.id = id
    this.tracks = tracks
    this.images = images
    this.playCount = playCount
    this.plays = plays
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
  }
}

export class Album {
  constructor({ id, name, artists, albumArtist, tracks, year, image, playCount, plays, lastPlayed, totalPlayDuration }) {
    this.name = name
    this.id = id
    this.artists = artists
    this.albumArtist = albumArtist
    this.tracks = tracks
    this.year = year
    this.image = image
    this.playCount = playCount
    this.plays = plays
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
  }
}

export class Track {
  constructor({ name, id, artistsBaseInfo, albumArtistBaseInfo, albumBaseInfo, image, year, duration, playCount, plays, lastPlayed, totalPlayDuration, isFavorite }) {
    this.name = name
    this.id = id
    this.artistsBaseInfo = artistsBaseInfo
    this.albumBaseInfo = albumBaseInfo
    this.image = image
    this.year = year
    this.duration = duration
    this.playCount = playCount
    this.plays = plays
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
    this.isFavorite = isFavorite
  }

  get albumArtist() {
    return this.albumBaseInfo.albumArtistBaseInfo
  }
}
