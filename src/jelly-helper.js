import { decode as decodeBlurhash } from 'blurhash';

export default class JellyHelper {

  constructor(auth) {
    this.auth = auth;
  }
  
  loadImage(elements, imageInfo, type = `track`) {

    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    
    const blurhash = imageInfo.blurhash
    const primaryTag = imageInfo.primaryTag
    const parentItemId = imageInfo.parentItemId
  
    if (blurhash) {
      const dataUri = blurhashToDataURI(blurhash)
      elements.forEach(element => {
        element.src = dataUri
      })
    } else {
      console.warn(`No blurhash found for item`)
      elements.forEach(element => {
        switch (type) {
          case `track`:
            element.src = `/media/TrackPlaceholder.png`
            break;
          case `artist`:
            element.src = `/media/ArtistPlaceholder.png`
            break;
            case `album`:
              element.src = `/media/AlbumPlaceholder.png`
            break;
        
          default:
            break;
        }
      })
    }
  
    if (primaryTag && parentItemId) {
      fetch(`${this.auth.config.baseUrl}/Items/${parentItemId}/Images/Primary?tag=${primaryTag}`, {
        method: `GET`,
        headers: {
          ...this.auth.config.defaultHeaders,
        },
      })
      .then(response => {
        if (response.ok) {
          const contentType = response.headers.get(`content-type`)
          if (contentType && contentType.includes(`image`)) {
            return response.blob()
          }
        }
      })
      .then(blob => {
        if (blob) {
          const objectUrl = URL.createObjectURL(blob)
          elements.forEach(element => {
            element.src = objectUrl
          })
        }
      })
    } else {
      console.warn(`No primary image found for item`)
      elements.forEach(element => {
        switch (type) {
          case `track`:
            element.src = `/media/TrackPlaceholder.png`
            break;
          case `artist`:
            element.src = `/media/ArtistPlaceholder.png`
            break;
            case `album`:
              element.src = `/media/AlbumPlaceholder.png`
            break;
        
          default:
            break;
        }
      })
    }
    
  }

}

function blurhashToDataURI(blurhash) {
  const pixels = decodeBlurhash(blurhash, 256, 256)
  const ctx = document.createElement(`canvas`).getContext(`2d`)
  const imageData = ctx.createImageData(256, 256)
  imageData.data.set(pixels)
  ctx.putImageData(imageData, 0, 0)
  return ctx.canvas.toDataURL()
}
