function estimateDistanceFromStrings(a,b){
  if(!a||!b) return 0
  const base = Math.abs(a.length - b.length) * 5
  const avg = (a.length + b.length) / 2
  return Math.max(1, Math.round(base + avg / 2))
}

async function geocode(query){
  if(!query) return null
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
  try{
    const resp = await fetch(endpoint, {headers:{'Accept':'application/json'}})
    if(!resp.ok) return null
    const data = await resp.json()
    if(!data || data.length === 0) return null
    return {lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon)}
  }catch(e){
    return null
  }
}

function haversineKm(lat1, lon1, lat2, lon2){
  const toRad = v => v * Math.PI / 180
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

window.CO2Utils = { estimateDistanceFromStrings, geocode, haversineKm }
