import React, { createContext, useContext, useState } from 'react';
import { mockRides } from '../data/mockRides';
import { NewRide, Ride } from '../types';

export const SELF_RIDER = 'You';

interface RidesContextValue {
  rides: Ride[];
  addRide: (draft: NewRide) => Ride;
  joinRide: (rideId: string, name?: string) => boolean;
}

const RidesContext = createContext<RidesContextValue | null>(null);

function createRideId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function RidesProvider({
  children,
  initialRides,
}: {
  children: React.ReactNode;
  initialRides?: Ride[];
}) {
  const [rides, setRides] = useState<Ride[]>(initialRides ?? mockRides);

  const addRide = (draft: NewRide): Ride => {
    const ride: Ride = {
      ...draft,
      id: createRideId(),
      riders: [],
    };
    setRides(prev => [ride, ...prev]);
    return ride;
  };

  const joinRide = (rideId: string, name: string = SELF_RIDER): boolean => {
    let joined = false;
    setRides(prev =>
      prev.map(ride => {
        if (ride.id !== rideId) {
          return ride;
        }
        if (ride.riders.includes(name) || ride.riders.length >= ride.maxRiders) {
          return ride;
        }
        joined = true;
        return { ...ride, riders: [...ride.riders, name] };
      }),
    );
    return joined;
  };

  return (
    <RidesContext.Provider value={{ rides, addRide, joinRide }}>
      {children}
    </RidesContext.Provider>
  );
}

export function useRides(): RidesContextValue {
  const value = useContext(RidesContext);
  if (!value) {
    throw new Error('useRides must be used inside <RidesProvider>');
  }
  return value;
}
