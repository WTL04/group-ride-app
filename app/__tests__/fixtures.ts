import { Ride } from '../src/types';

export const fixtureRides: Ride[] = [
  {
    id: '1',
    title: 'Saturday Morning Loop',
    startDateTime: '2026-11-01T08:00:00',
    distance: 28,
    distanceUnit: 'mi',
    startLocation: 'Central Park',
    endLocation: 'Central Park',
    difficulty: 'intermediate',
    avgPace: 5,
    maxRiders: 10,
    riders: ['Alice', 'Bob'],
    description: 'Easy-paced group loop. No-drop ride.',
  },
  {
    id: '2',
    title: 'Evening City Cruise',
    startDateTime: '2026-11-03T18:00:00',
    distance: 20,
    distanceUnit: 'km',
    startLocation: 'Downtown Plaza',
    endLocation: 'Riverside Landing',
    difficulty: 'casual',
    avgPace: null,
    maxRiders: 15,
    riders: ['Cara'],
    description: 'Casual evening spin through the city.',
  },
];

export function installFetchMock() {
  const realFetch = globalThis.fetch;
  let nextId = 101;
  const mock = jest.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST') {
      const body = JSON.parse(String(init.body ?? '{}'));
      const rideId = nextId++;
      return {
        ok: true,
        status: 201,
        json: async () => ({ ride_id: rideId, ...body }),
      };
    }
    return { ok: true, status: 200, json: async () => [] };
  });
  globalThis.fetch = mock as unknown as typeof fetch;
  return () => {
    globalThis.fetch = realFetch;
  };
}
