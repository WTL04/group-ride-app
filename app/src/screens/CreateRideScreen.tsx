import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type BottomSheet from '@gorhom/bottom-sheet';
import { DateTimePickerChangeEvent } from '@react-native-community/datetimepicker';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EMPTY_ROUTE, RoutePicker, RouteValue } from '../components/RoutePicker';
import { RideFormSheet } from '../components/create-ride/RideFormSheet';
import { STADIA_API_KEY } from '@env';
import { fromKm } from '../lib/stadia';
import { useRides } from '../store/RidesContext';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import {
  Difficulty,
  DistanceUnit,
  MAX_DESCRIPTION_LENGTH,
  MAX_DISTANCE,
  MAX_PACE_MIN_PER_UNIT,
  MAX_RIDERS_LIMIT,
  MAX_TEXT_LENGTH,
  NewRide,
  Ride,
} from '../types';

type ScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Create'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Props = Partial<ScreenProps> & {
  onCreate?: (ride: Ride) => void;
};

const DECIMAL_RE = /^\d+(\.\d+)?$/;
const INTEGER_RE = /^\d+$/;

const codePoints = (s: string) => Array.from(s).length;

function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  if (!DECIMAL_RE.test(text)) {
    return null;
  }
  const value = parseFloat(text);
  return Number.isFinite(value) ? value : null;
}

function parseInteger(raw: string): number | null {
  const text = raw.trim();
  if (!INTEGER_RE.test(text)) {
    return null;
  }
  const value = parseInt(text, 10);
  return Number.isSafeInteger(value) ? value : null;
}

function defaultStart(): Date {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(8, 0, 0, 0);
  return start;
}

function withCalendarDate(datePart: Date, timePart: Date): Date {
  const merged = new Date(timePart);
  merged.setFullYear(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
  );
  return merged;
}

export function CreateRideScreen({ navigation, onCreate }: Props) {
  const { addRide } = useRides();
  const [title, setTitle] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>('mi');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [avgPace, setAvgPace] = useState('');
  const [maxRiders, setMaxRiders] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState(defaultStart);
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [errors, setErrors] = useState<string[]>([]);
  const [createdTitle, setCreatedTitle] = useState('');
  const [route, setRoute] = useState<RouteValue>(EMPTY_ROUTE);
  const sheetRef = useRef<BottomSheet>(null);
  const unitRef = useRef<DistanceUnit>(distanceUnit);
  unitRef.current = distanceUnit;

  const handleSnap = useCallback((_index: number) => {}, []);

  const expandSheet = useCallback(() => {
    sheetRef.current?.snapToIndex(2);
  }, []);

  const handleRouteChange = (next: RouteValue) => {
    setRoute(next);
    if (next.startLabel) setStartLocation(next.startLabel);
    if (next.endLabel) setEndLocation(next.endLabel);
    if (next.distanceKm !== null) {
      setDistance(fromKm(next.distanceKm, unitRef.current).toFixed(1));
    }
    if (next.distanceKm === null && next.start === null) {
      setDistance('');
    }
  };

  const handleUnitChange = (unit: DistanceUnit) => {
    setDistanceUnit(unit);
    if (route.distanceKm !== null) {
      setDistance(fromKm(route.distanceKm, unit).toFixed(1));
    }
  };

  const resetForm = () => {
    setTitle('');
    setRoute({ ...EMPTY_ROUTE });
    setStartLocation('');
    setEndLocation('');
    setDistance('');
    setAvgPace('');
    setMaxRiders('');
    setDescription('');
    setStart(defaultStart());
    setPendingDate(null);
  };

  const openPicker = () => {
    setPendingDate(null);
    setPickerMode('date');
    setShowPicker(true);
  };

  const handleDateSelected = (
    event: DateTimePickerChangeEvent,
    date: Date,
  ) => {
    if (Platform.OS === 'android' && pickerMode === 'date') {
      setPendingDate(date);
      setPickerMode('time');
      return;
    }
    setStart(withCalendarDate(pendingDate ?? date, date));
    setPendingDate(null);
    setShowPicker(false);
  };

  const closePicker = () => {
    setPendingDate(null);
    setPickerMode('date');
    setShowPicker(false);
  };

  const handleCreate = async () => {
    const problems: string[] = [];
    const trimmedTitle = title.trim();
    const trimmedStart = startLocation.trim();
    const trimmedEnd = endLocation.trim();
    const trimmedDescription = description.trim();
    const parsedDistance = parseDecimal(distance);
    const parsedMaxRiders = parseInteger(maxRiders);
    const paceSkipped = avgPace.trim() === '';
    const parsedPace = paceSkipped ? null : parseDecimal(avgPace);

    if (!trimmedTitle) {
      problems.push('Title is required.');
    } else if (codePoints(trimmedTitle) > MAX_TEXT_LENGTH) {
      problems.push(`Title must be ${MAX_TEXT_LENGTH} characters or fewer.`);
    }
    if (!trimmedStart) {
      problems.push('Start location is required.');
    } else if (codePoints(trimmedStart) > MAX_TEXT_LENGTH) {
      problems.push(
        `Start location must be ${MAX_TEXT_LENGTH} characters or fewer.`,
      );
    }
    if (!trimmedEnd) {
      problems.push('End location is required.');
    } else if (codePoints(trimmedEnd) > MAX_TEXT_LENGTH) {
      problems.push(
        `End location must be ${MAX_TEXT_LENGTH} characters or fewer.`,
      );
    }
    if (parsedDistance === null || parsedDistance <= 0) {
      problems.push('Distance must be a plain number greater than 0.');
    } else if (parsedDistance > MAX_DISTANCE) {
      problems.push(`Distance must be ${MAX_DISTANCE} or less.`);
    }
    if (!paceSkipped) {
      if (parsedPace === null || parsedPace <= 0) {
        problems.push('Average pace must be a plain number greater than 0.');
      } else if (parsedPace > MAX_PACE_MIN_PER_UNIT) {
        problems.push(
          `Average pace must be ${MAX_PACE_MIN_PER_UNIT} min/${distanceUnit} or less.`,
        );
      }
    }
    if (
      parsedMaxRiders === null ||
      parsedMaxRiders < 1 ||
      parsedMaxRiders > MAX_RIDERS_LIMIT
    ) {
      problems.push(
        `Max riders must be a whole number between 1 and ${MAX_RIDERS_LIMIT}.`,
      );
    }
    if (codePoints(trimmedDescription) > MAX_DESCRIPTION_LENGTH) {
      problems.push(
        `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
      );
    }
    if (start.getTime() < Date.now() - 60_000) {
      problems.push('Start date and time must be in the future.');
    }

    if (
      parsedDistance === null ||
      parsedMaxRiders === null ||
      problems.length > 0
    ) {
      setErrors(problems);
      setCreatedTitle('');
      return;
    }

    const draft: NewRide = {
      title: trimmedTitle,
      startDateTime: start.toISOString(),
      startLocation: trimmedStart,
      endLocation: trimmedEnd,
      distance: parsedDistance,
      distanceUnit,
      difficulty,
      avgPace: parsedPace,
      maxRiders: parsedMaxRiders,
      description: trimmedDescription,
    };
    try {
      const ride = await addRide(draft);
      onCreate?.(ride);
      setErrors([]);
      resetForm();
      if (navigation) {
        setCreatedTitle('');
        navigation.navigate('RideDetails', { rideId: ride.id });
      } else {
        setCreatedTitle(ride.title);
      }
    } catch (e) {
      setErrors([
        e instanceof Error ? e.message : 'Could not create ride.',
      ]);
      setCreatedTitle('');
    }
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.map}>
        <RoutePicker
          apiKey={STADIA_API_KEY ?? ''}
          distanceUnit={distanceUnit}
          value={route}
          onChange={handleRouteChange}
          fullscreen
        />
      </View>
      <View style={styles.searchFloat} pointerEvents="box-none">
        <TextInput
          testID="route-search-bar"
          accessibilityLabel="Search or set ride title"
          style={styles.search}
          value={title}
          onChangeText={setTitle}
          onFocus={expandSheet}
          placeholder="Search or name this ride"
          maxLength={MAX_TEXT_LENGTH}
        />
      </View>
      <RideFormSheet
        sheetRef={sheetRef}
        onSnap={handleSnap}
        title={title}
        onTitle={setTitle}
        startLocation={startLocation}
        onStartLocation={setStartLocation}
        endLocation={endLocation}
        onEndLocation={setEndLocation}
        distance={distance}
        onDistance={setDistance}
        distanceUnit={distanceUnit}
        onUnit={handleUnitChange}
        difficulty={difficulty}
        onDifficulty={setDifficulty}
        avgPace={avgPace}
        onAvgPace={setAvgPace}
        maxRiders={maxRiders}
        onMaxRiders={setMaxRiders}
        description={description}
        onDescription={setDescription}
        start={start}
        onOpenPicker={openPicker}
        showPicker={showPicker}
        pickerMode={pickerMode}
        pendingDate={pendingDate}
        onDateSelected={handleDateSelected}
        onClosePicker={closePicker}
        route={route}
        errors={errors}
        createdTitle={createdTitle}
        onCreate={handleCreate}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
  searchFloat: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  search: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
});
