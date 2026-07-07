/** Decodes a Google Encoded Polyline (precision 5) into [lat, lng] pairs. */
export function decodePolyline(str: string): [number, number][] {
  let index = 0
  let lat = 0
  let lng = 0
  const coords: [number, number][] = []
  while (index < str.length) {
    let b: number
    let shift = 0
    let result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    shift = 0
    result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    coords.push([lat / 1e5, lng / 1e5])
  }
  return coords
}
