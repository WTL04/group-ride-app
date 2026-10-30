import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { createRide as postRide, listRides } from '../lib/api';
import { NewRide, Ride } from '../types';

export const SELF_RIDER = 'You';

interface RidesContextValue {
  rides: Ride[];
  loading: boolean;
  loadError: string | null;
  addRide: (draft: NewRide) => Promise<Ride>;
  joinRide: (rideId: string, name?: string) => boolean;
}

const RidesContext = createContext<RidesContextValue | null>(null);

export function RidesProvider({
  children,
  initialRides,
}: {
  children: React.ReactNode;
  initialRides?: Ride[];
}) {
  const [rides, setRides] = useState<Ride[]>(initialRides ?? []);
  const [loading, setLoading] = useState(initialRides === undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRides !== undefined) {
      return;
    }
    let cancelled = false;
    listRides().then(
      fetched => {
        if (!cancelled) {
          setRides(fetched);
          setLoadError(null);
          setLoading(false);
        }
      },
      (e: unknown) => {
        if (!cancelled) {
          setLoadError(
            e instanceof Error ? e.message : 'Could not load rides.',
          );
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [initialRides]);

  const addRide = useCallback(async (draft: NewRide): Promise<Ride> => {
    const ride = await postRide(draft);
    setRides(prev => [ride, ...prev]);
    return ride;
  }, []);

  const joinRide = (rideId: string, name: string = SELF_RIDER): boolean => {
    // Local until server join lands with memberships and guest tokens.
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
    <RidesContext.Provider
      value={{ rides, loading, loadError, addRide, joinRide }}>
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
