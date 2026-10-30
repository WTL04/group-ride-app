import { Platform } from 'react-native';
import type { NewRide, Ride } from '../types';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';

const MI_TO_KM = 1.60934;

interface ApiRide {
  ride_id: number;
  title: string;
  starts_at: string;
  start_location: string | null;
  end_location: string | null;
  distance_km: number | null;
  difficulty: Ride['difficulty'] | null;
  avg_pace: number | null;
  max_riders: number | null;
  description: string | null;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(res.status, `Request failed with status ${res.status}.`);
  }
  return res.json() as Promise<T>;
}

function toRide(row: ApiRide): Ride {
  return {
    id: String(row.ride_id),
    title: row.title,
    startDateTime: row.starts_at,
    distance: row.distance_km ?? 0,
    distanceUnit: 'km',
    startLocation: row.start_location ?? '',
    endLocation: row.end_location ?? '',
    difficulty: row.difficulty ?? 'casual',
    avgPace: row.avg_pace,
    maxRiders: row.max_riders ?? 1,
    riders: [],
    description: row.description ?? '',
  };
}

export async function listRides(): Promise<Ride[]> {
  const rows = await request<ApiRide[]>('/rides/');
  return rows.map(toRide);
}

export async function createRide(draft: NewRide): Promise<Ride> {
  const row = await request<ApiRide>('/rides/', {
    method: 'POST',
    body: JSON.stringify({
      title: draft.title,
      starts_at: draft.startDateTime,
      start_location: draft.startLocation,
      end_location: draft.endLocation,
      distance_km:
        draft.distanceUnit === 'mi'
          ? draft.distance * MI_TO_KM
          : draft.distance,
      difficulty: draft.difficulty,
      avg_pace: draft.avgPace,
      max_riders: draft.maxRiders,
      description: draft.description || null,
    }),
  });
  return toRide(row);
}
