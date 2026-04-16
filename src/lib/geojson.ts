export type Coordinate = {
  lat: number;
  lng: number;
};

export type GeoJsonPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export const MIN_POLYGON_POINTS = 3;
export const MAX_POLYGON_POINTS = 6;

function sameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a.lat === b.lat && a.lng === b.lng;
}

function isFiniteCoordinate(value: number): boolean {
  return Number.isFinite(value);
}

export function normalizeCoordinates(input: Coordinate[]): Coordinate[] {
  const cleaned = input.filter(
    (coord) => coord && isFiniteCoordinate(coord.lat) && isFiniteCoordinate(coord.lng)
  );

  if (cleaned.length > 1 && sameCoordinate(cleaned[0], cleaned[cleaned.length - 1])) {
    return cleaned.slice(0, -1);
  }

  return cleaned;
}

export function validateCoordinates(input: Coordinate[]): { valid: boolean; error?: string } {
  const coordinates = normalizeCoordinates(input);

  if (coordinates.length < MIN_POLYGON_POINTS) {
    return {
      valid: false,
      error: 'A polygon needs at least 3 coordinates.',
    };
  }

  if (coordinates.length > MAX_POLYGON_POINTS) {
    return {
      valid: false,
      error: `A polygon can have at most ${MAX_POLYGON_POINTS} coordinates.`,
    };
  }

  const hasOutOfRange = coordinates.some(
    (coord) => coord.lat < -90 || coord.lat > 90 || coord.lng < -180 || coord.lng > 180
  );

  if (hasOutOfRange) {
    return {
      valid: false,
      error: 'Coordinates are out of range. Latitude must be between -90 and 90, longitude between -180 and 180.',
    };
  }

  return { valid: true };
}

export function toGeoJsonPolygon(input: Coordinate[]): GeoJsonPolygon {
  const coordinates = normalizeCoordinates(input);
  const validation = validateCoordinates(coordinates);

  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid polygon coordinates.');
  }

  const ring = coordinates.map((coord) => [coord.lng, coord.lat]);
  ring.push([coordinates[0].lng, coordinates[0].lat]);

  return {
    type: 'Polygon',
    coordinates: [ring],
  };
}

function getPolygonGeometry(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const root = data as Record<string, unknown>;
  const rootType = root.type;

  if (rootType === 'Polygon') {
    return root;
  }

  if (rootType === 'Feature') {
    return root.geometry;
  }

  if (rootType === 'FeatureCollection' && Array.isArray(root.features)) {
    for (const feature of root.features) {
      if (!feature || typeof feature !== 'object') {
        continue;
      }
      const geometry = (feature as Record<string, unknown>).geometry;
      if (geometry && typeof geometry === 'object') {
        const geometryType = (geometry as Record<string, unknown>).type;
        if (geometryType === 'Polygon') {
          return geometry;
        }
      }
    }
  }

  return null;
}

export function extractCoordinatesFromGeoJson(data: unknown): Coordinate[] {
  const geometry = getPolygonGeometry(data);

  if (!geometry || typeof geometry !== 'object') {
    throw new Error('GeoJSON must contain a Polygon geometry.');
  }

  const polygon = geometry as { coordinates?: unknown; type?: unknown };

  if (polygon.type !== 'Polygon' || !Array.isArray(polygon.coordinates) || !Array.isArray(polygon.coordinates[0])) {
    throw new Error('GeoJSON Polygon coordinates are invalid.');
  }

  const ring = polygon.coordinates[0] as unknown[];
  const coordinates: Coordinate[] = [];

  for (const point of ring) {
    if (!Array.isArray(point) || point.length < 2) {
      throw new Error('GeoJSON Polygon has an invalid coordinate pair.');
    }

    const lng = Number(point[0]);
    const lat = Number(point[1]);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new Error('GeoJSON Polygon has non-numeric coordinates.');
    }

    coordinates.push({ lat, lng });
  }

  return normalizeCoordinates(coordinates);
}
