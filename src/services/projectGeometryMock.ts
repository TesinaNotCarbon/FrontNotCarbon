import {
  type Coordinate,
  type GeoJsonPolygon,
  validateCoordinates,
} from '../lib/geojson';

export type GeometrySourceTab = 'map' | 'inputs' | 'upload';

export type ProjectGeometryPayload = {
  projectName: string;
  description: string;
  coordinates: Coordinate[];
  geoJson: GeoJsonPolygon;
  sourceTab: GeometrySourceTab;
};

export type ProjectGeometryResponse = {
  status: 'ok';
  id: string;
  receivedAt: string;
  points: number;
  sourceTab: GeometrySourceTab;
};

export async function postProjectGeometryMock(
  payload: ProjectGeometryPayload
): Promise<ProjectGeometryResponse> {
  const validation = validateCoordinates(payload.coordinates);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid polygon.');
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  if (payload.projectName.trim().toLowerCase() === 'fail-mock') {
    throw new Error('Mock API rejected this payload intentionally (projectName: fail-mock).');
  }

  return {
    status: 'ok',
    id: `mock-${Date.now()}`,
    receivedAt: new Date().toISOString(),
    points: payload.coordinates.length,
    sourceTab: payload.sourceTab,
  };
}
