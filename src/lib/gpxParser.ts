import type { GpxTrackPoint, GpxRouteData } from '@/types/rally';

export function parseGpx(xmlString: string): GpxRouteData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const allEls = Array.from(doc.querySelectorAll('*'));

  const parseError = allEls.find(el => el.localName === 'parsererror');
  if (parseError) {
    throw new Error('Invalid GPX file: XML parse error');
  }

  const nameEl = allEls.find(el =>
    el.localName === 'name' && ['metadata', 'trk', 'rte'].includes(el.parentElement?.localName ?? '')
  );
  const name = nameEl?.textContent || 'GPX Track';

  const points: GpxTrackPoint[] = [];

  const trkpts = allEls.filter(el => el.localName === 'trkpt');
  const rtepts = allEls.filter(el => el.localName === 'rtept');
  const wpts = allEls.filter(el => el.localName === 'wpt');

  const processPoint = (el: Element) => {
    const lat = parseFloat(el.getAttribute('lat') || '0');
    const lon = parseFloat(el.getAttribute('lon') || '0');
    const eleEl = el.querySelector('ele');
    const timeEl = el.querySelector('time');

    if (isFinite(lat) && isFinite(lon)) {
      points.push({
        lat,
        lon,
        ele: eleEl?.textContent ? parseFloat(eleEl.textContent) : undefined,
        time: timeEl?.textContent || undefined,
      });
    }
  };

  trkpts.forEach(processPoint);
  if (points.length === 0) {
    rtepts.forEach(processPoint);
  }
  if (points.length === 0) {
    wpts.forEach(processPoint);
  }

  if (points.length === 0) {
    throw new Error('No track points found in GPX file');
  }

  let totalDistance = 0;
  let elevationGain = 0;
  let elevationLoss = 0;

  for (let i = 1; i < points.length; i++) {
    const dist = haversineDistance(points[i - 1], points[i]);
    totalDistance += dist;

    if (points[i].ele !== undefined && points[i - 1].ele !== undefined) {
      const diff = points[i].ele - points[i - 1].ele;
      if (diff > 0) elevationGain += diff;
      else elevationLoss += Math.abs(diff);
    }
  }

  return {
    name,
    points,
    totalDistance: Math.round(totalDistance * 100) / 100,
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
  };
}

function haversineDistance(a: GpxTrackPoint, b: GpxTrackPoint): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const c = 2 * Math.atan2(
    Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon),
    Math.sqrt(1 - (sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon))
  );

  return R * c;
}

function toRad(deg: number): number {
  return deg * Math.PI / 180;
}

export function gpxToSvgPath(
  points: GpxTrackPoint[],
  width: number,
  height: number,
  padding: number = 20,
  bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number },
): string {
  if (points.length < 2) return '';

  const minLat = bounds?.minLat ?? Math.min(...points.map(p => p.lat));
  const maxLat = bounds?.maxLat ?? Math.max(...points.map(p => p.lat));
  const minLon = bounds?.minLon ?? Math.min(...points.map(p => p.lon));
  const maxLon = bounds?.maxLon ?? Math.max(...points.map(p => p.lon));

  const latRange = maxLat - minLat || 0.001;
  const lonRange = maxLon - minLon || 0.001;

  const usableW = width - padding * 2;
  const usableH = height - padding * 2;

  const mapped = points.map(p => ({
    x: padding + ((p.lon - minLon) / lonRange) * usableW,
    y: padding + (1 - (p.lat - minLat) / latRange) * usableH,
  }));

  let path = `M ${mapped[0].x.toFixed(1)} ${mapped[0].y.toFixed(1)}`;
  for (let i = 1; i < mapped.length; i++) {
    path += ` L ${mapped[i].x.toFixed(1)} ${mapped[i].y.toFixed(1)}`;
  }

  return path;
}

export function computeGpxBounds(points: GpxTrackPoint[]) {
  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    centerLat: (Math.min(...lats) + Math.max(...lats)) / 2,
    centerLon: (Math.min(...lons) + Math.max(...lons)) / 2,
  };
}
