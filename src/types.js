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
  constructor({ id, name, tracks, images, playCount, uniqueTracks, plays, lastPlayed, totalPlayDuration }) {
    this.name = name
    this.id = id
    this.tracks = tracks
    this.images = images
    this.playCount = playCount
    this.uniqueTracks = uniqueTracks
    this.plays = plays
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
  }

  /**
   * Only return things that are not a long array or large object
   * Convert long arrays to their length
   */
   subsetOnly() {
    return {
      id: this.id,
      name: this.name,
      tracks: this.tracks.length,
      images: this.images,
      playCount: this.playCount,
      uniqueTracks: this.uniqueTracks.length,
      plays: this.plays.length,
      lastPlayed: this.lastPlayed,
      totalPlayDuration: this.totalPlayDuration,
    }
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

  /**
   * Only return things that are not a long array or large object
   * Convert long arrays to their length
   */
   subsetOnly() {
    return {
      id: this.id,
      name: this.name,
      artists: this.artists.length,
      albumArtist: this.albumArtist,
      tracks: this.tracks.length,
      year: this.year,
      image: this.image,
      playCount: this.playCount,
      plays: this.plays.length,
      lastPlayed: this.lastPlayed,
      totalPlayDuration: this.totalPlayDuration,
    }
  }
}

export class Track {
  constructor({ name, id, artistsBaseInfo, albumBaseInfo, genreBaseInfo, image, year, duration, playCount, plays, lastPlayed, totalPlayDuration, isFavorite }) {
    this.name = name
    this.id = id
    this.artistsBaseInfo = artistsBaseInfo
    this.albumBaseInfo = albumBaseInfo
    this.genreBaseInfo = genreBaseInfo
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

  /**
   * Only return things that are not a long array or large object
   * Convert long arrays to their length
   */
   subsetOnly() {
    return {
      id: this.id,
      name: this.name,
      artistsBaseInfo: this.artistsBaseInfo,
      albumBaseInfo: this.albumBaseInfo,
      genreBaseInfo: this.genreBaseInfo,
      image: this.image,
      year: this.year,
      duration: this.duration,
      playCount: this.playCount,
      plays: this.plays.length,
      lastPlayed: this.lastPlayed,
      totalPlayDuration: this.totalPlayDuration,
      isFavorite: this.isFavorite
    }
  }
  
}

export class Genre {
  constructor({ id, name, tracks, image, playCount, uniqueTracks, plays, lastPlayed, totalPlayDuration }) {
    this.name = name
    this.id = id
    this.tracks = tracks
    this.image = image
    this.playCount = playCount
    this.uniqueTracks = uniqueTracks
    this.plays = plays
    this.lastPlayed = lastPlayed
    this.totalPlayDuration = totalPlayDuration
  }

  /**
   * Only return things that are not a long array or large object
   * Convert long arrays to their length
   */
  subsetOnly() {
    return {
      id: this.id,
      name: this.name,
      tracks: this.tracks.length,
      image: this.image,
      playCount: this.playCount,
      uniqueTracks: this.uniqueTracks.length,
      plays: this.plays.length,
      lastPlayed: this.lastPlayed,
      totalPlayDuration: this.totalPlayDuration
    }
  }
}
