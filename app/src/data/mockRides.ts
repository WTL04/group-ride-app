import { Ride } from '../types';

export const mockRides: Ride[] = [
  {
    id: '1',
    title: 'Saturday Morning Loop',
    date: '2026-11-01T08:00:00',
    distanceKm: 45,
    startLocation: 'Central Park',
    riders: ['Alice', 'Bob'],
    maxRiders: 10,
    difficulty: 'moderate',
    description: 'Easy-paced group loop. No-drop ride.',
  },
  {
    id: '2',
    title: 'Evening City Cruise',
    date: '2026-11-03T18:00:00',
    distanceKm: 20,
    startLocation: 'Downtown Plaza',
    riders: ['Cara'],
    maxRiders: 15,
    difficulty: 'easy',
    description: 'Casual evening spin through the city.',
  },
  {
    id: '3',
    title: 'Hill Climb Challenge',
    date: '2026-11-08T07:00:00',
    distanceKm: 60,
    startLocation: 'North Trailhead',
    riders: ['Dan', 'Eve', 'Frank'],
    maxRiders: 8,
    difficulty: 'hard',
    description: 'Climbing-focused ride for experienced riders.',
  },
];
