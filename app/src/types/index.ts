export type Difficulty = 'casual' | 'intermediate' | 'challenging';
export type DistanceUnit = 'mi' | 'km';

export const DIFFICULTIES: Difficulty[] = [
  'casual',
  'intermediate',
  'challenging',
];
export const DISTANCE_UNITS: DistanceUnit[] = ['mi', 'km'];

export const MAX_RIDERS_LIMIT = 50;
export const MAX_TEXT_LENGTH = 50;
export const MAX_DESCRIPTION_LENGTH = 280;
export const MAX_DISTANCE = 1000;
export const MAX_PACE_MIN_PER_UNIT = 120;

export interface Ride {
  id: string;
  title: string;
  date: string;
  /** Scheduled start, ISO string. */
  startDateTime: string;
  distance: number;
  distanceUnit: DistanceUnit;
  startLocation: string;
  endLocation: string;
  difficulty: Difficulty;
  avgPace: number | null;
  maxRiders: number;
  riders: string[];
  description: string;
}

export interface User {
  id: string;
  name: string;
}

export interface NewRide {
  title: string;
  /** Scheduled start, ISO string. */
  startDateTime: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  distanceUnit: DistanceUnit;
  difficulty: Difficulty;
  avgPace: number | null;
  maxRiders: number;
  description: string;
}
