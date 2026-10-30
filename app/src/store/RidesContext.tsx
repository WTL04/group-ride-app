import React, { createContext, useContext, useState } from 'react';
import { mockRides } from '../data/mockRides';
import { NewRide, Ride } from '../types';

interface RidesContextValue {
  rides: Ride[];
  addRide: (draft: NewRide) => Ride;
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
      date: new Date().toISOString(),
      riders: [],
    };
    setRides(prev => [ride, ...prev]);
    return ride;
  };

  return (
    <RidesContext.Provider value={{ rides, addRide }}>
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
