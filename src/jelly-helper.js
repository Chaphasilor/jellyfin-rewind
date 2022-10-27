import { decode as decodeBlurhash } from 'blurhash';

export default class JellyHelper {

  constructor(auth) {
    this.auth = auth;
  }
  
  loadImage(element, imageInfo) {

    const blurhash = imageInfo.blurhash
    const primaryTag = imageInfo.primaryTag
    const parentItemId = imageInfo.parentItemId
  
    if (blurhash) {
      element.src = blurhashToDataURI(blurhash)
    }
  
    if (primaryTag) {
      fetch(`${this.auth.config.baseUrl}/Items/${parentItemId}/Images/Primary?tag=${primaryTag}`, {
        method: 'GET',
        headers: {
          ...this.auth.config.defaultHeaders,
        },
      })
      .then(response => {
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('image')) {
            return response.blob()
          }
        }
      })
      .then(blob => {
        if (blob) {
          element.src = URL.createObjectURL(blob)
        }
      })
    }
    
  }

}

function blurhashToDataURI(blurhash) {
  const pixels = decodeBlurhash(blurhash, 128, 128)
  const ctx = document.createElement('canvas').getContext('2d')
  const imageData = ctx.createImageData(128, 128)
  imageData.data.set(pixels)
  ctx.putImageData(imageData, 0, 0)
  return ctx.canvas.toDataURL()
}
