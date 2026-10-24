export type Difficulty = 'easy' | 'moderate' | 'hard';

export interface Ride {
  id: string;
  title: string;
  date: string;
  distanceKm: number;
  startLocation: string;
  riders: string[];
  maxRiders: number;
  difficulty: Difficulty;
  description: string;
}

export interface User {
  id: string;
  name: string;
}
