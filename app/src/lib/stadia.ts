export interface LatLon {
  lat: number;
  lon: number;
}

export interface RouteResult {
  coordinates: LatLon[];
  distanceKm: number;
}

// One source of truth for conversions (used by RoutePicker + CreateRideScreen).
export const MI_TO_KM = 1.60934;

export function toKm(distance: number, unit: 'mi' | 'km'): number {
  return unit === 'mi' ? distance * MI_TO_KM : distance;
}

export function fromKm(distanceKm: number, unit: 'mi' | 'km'): number {
  return unit === 'mi' ? distanceKm / MI_TO_KM : distanceKm;
}

export function formatDistance(distanceKm: number, unit: 'mi' | 'km'): string {
  const v = fromKm(distanceKm, unit);
  return `${v.toFixed(1)} ${unit}`;
}

// Fallback when no API key / offline. Marked explicit so a straight line
// never silently passes as a snapped bike route.
export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h =
    s1 * s1 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      s2 *
      s2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Valhalla returns shape as encoded polyline with precision 6 by default.
export function decodePolyline6(encoded: string): LatLon[] {
  let lat = 0;
  let lon = 0;
  let i = 0;
  const out: LatLon[] = [];
  while (i < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(i++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLon = result & 1 ? ~(result >> 1) : result >> 1;
    lon += dLon;
    out.push({ lat: lat / 1e6, lon: lon / 1e6 });
  }
  return out;
}

export function stadiaStyleUrl(apiKey: string): string {
  return `https://tiles.stadiamaps.com/styles/outdoors.json?api_key=${apiKey}`;
}

export async function fetchBicycleRoute(
  points: LatLon[],
  apiKey: string,
): Promise<RouteResult> {
  const res = await fetch(
    `https://api.stadiamaps.com/route/v1?api_key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: points.map(p => ({ lat: p.lat, lon: p.lon })),
        costing: 'bicycle',
        costing_options: { bicycle: { use_roads: 0.3 } },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Route failed (${res.status}).`);
  }
  const json = await res.json();
  const leg = json?.trip?.legs?.[0];
  const shape: string | undefined = leg?.shape ?? json?.trip?.shape;
  const summary = leg?.summary ?? json?.trip?.summary;
  if (!shape || typeof summary?.length !== 'number') {
    throw new Error('Route response missing shape.');
  }
  return {
    coordinates: decodePolyline6(shape),
    distanceKm: summary.length,
  };
}

export async function reverseLabel(
  point: LatLon,
  apiKey: string,
): Promise<string> {
  const res = await fetch(
    `https://api.stadiamaps.com/geocoding/v1/reverse?point.lat=${point.lat}&point.lon=${point.lon}&size=1&api_key=${apiKey}`,
  );
  if (!res.ok) {
    throw new Error(`Reverse geocode failed (${res.status}).`);
  }
  const json = await res.json();
  const label: string | undefined = json?.features?.[0]?.properties?.label;
  if (!label) {
    return `${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}`;
  }
  return label;
}
