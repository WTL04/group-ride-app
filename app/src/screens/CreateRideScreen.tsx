import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { formatRideDateTime } from '../lib/formatRideDate';
import { useRides } from '../store/RidesContext';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';
import {
  DIFFICULTIES,
  DISTANCE_UNITS,
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

  const resetForm = () => {
    setTitle('');
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
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Create a ride</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          testID="title-input"
          accessibilityLabel="Ride title"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Saturday Morning Loop"
          maxLength={MAX_TEXT_LENGTH}
        />
        <Text style={styles.helper}>
          Up to {MAX_TEXT_LENGTH} characters.
        </Text>

        <Text style={styles.label}>Start location</Text>
        <TextInput
          testID="start-location-input"
          accessibilityLabel="Ride start location"
          style={styles.input}
          value={startLocation}
          onChangeText={setStartLocation}
          placeholder="Central Park"
          maxLength={MAX_TEXT_LENGTH}
        />
        <Text style={styles.helper}>
          Up to {MAX_TEXT_LENGTH} characters.
        </Text>

        <Text style={styles.label}>End location</Text>
        <TextInput
          testID="end-location-input"
          accessibilityLabel="Ride end location"
          style={styles.input}
          value={endLocation}
          onChangeText={setEndLocation}
          placeholder="Riverside Cafe"
          maxLength={MAX_TEXT_LENGTH}
        />
        <Text style={styles.helper}>
          Up to {MAX_TEXT_LENGTH} characters.
        </Text>

        <Text style={styles.label}>Units</Text>
        <View
          style={styles.optionRow}
          accessibilityRole="radiogroup"
          accessibilityLabel="Units for distance and average pace">
          {DISTANCE_UNITS.map((unit, i) => (
            <Pressable
              key={unit}
              testID={`distance-unit-${unit}`}
              accessibilityRole="radio"
              accessibilityLabel={`${unit === 'mi' ? 'Miles' : 'Kilometers'}, ${i + 1} of ${DISTANCE_UNITS.length}`}
              accessibilityState={{ selected: distanceUnit === unit }}
              style={[
                styles.option,
                distanceUnit === unit && styles.optionSelected,
              ]}
              onPress={() => setDistanceUnit(unit)}>
              <Text
                style={[
                  styles.optionText,
                  distanceUnit === unit && styles.optionTextSelected,
                ]}>
                {unit}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Distance ({distanceUnit})</Text>
        <TextInput
          testID="distance-input"
          accessibilityLabel={`Ride distance in ${distanceUnit}`}
          style={styles.input}
          value={distance}
          onChangeText={setDistance}
          placeholder="25"
          keyboardType="decimal-pad"
        />
        <Text style={styles.helper}>Numbers only, e.g. 25 or 25.5.</Text>

        <Text style={styles.label}>
          Average pace (min/{distanceUnit}, optional)
        </Text>
        <TextInput
          testID="avg-pace-input"
          accessibilityLabel={`Average pace in minutes per ${distanceUnit}, optional`}
          style={styles.input}
          value={avgPace}
          onChangeText={setAvgPace}
          placeholder="6"
          keyboardType="decimal-pad"
        />
        <Text style={styles.helper}>
          Minutes per {distanceUnit} — lower is faster. Leave blank to skip.
        </Text>

        <Text style={styles.label}>Difficulty</Text>
        <View
          style={styles.optionRow}
          accessibilityRole="radiogroup"
          accessibilityLabel="Difficulty">
          {DIFFICULTIES.map((level, i) => (
            <Pressable
              key={level}
              testID={`difficulty-${level}`}
              accessibilityRole="radio"
              accessibilityLabel={`Difficulty ${level}, ${i + 1} of ${DIFFICULTIES.length}`}
              accessibilityState={{ selected: difficulty === level }}
              style={[
                styles.option,
                difficulty === level && styles.optionSelected,
              ]}
              onPress={() => setDifficulty(level)}>
              <Text
                style={[
                  styles.optionText,
                  difficulty === level && styles.optionTextSelected,
                ]}>
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Max riders (up to {MAX_RIDERS_LIMIT})</Text>
        <TextInput
          testID="max-riders-input"
          accessibilityLabel="Maximum number of riders"
          style={styles.input}
          value={maxRiders}
          onChangeText={setMaxRiders}
          placeholder="10"
          keyboardType="number-pad"
          maxLength={3}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          testID="description-input"
          accessibilityLabel="Ride description, optional"
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="No-drop ride, regroup at the top of each climb."
          multiline
          numberOfLines={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
        <Text style={styles.helper}>
          Up to {MAX_DESCRIPTION_LENGTH} characters.
        </Text>

        <Text style={styles.label}>Starts</Text>
        <Pressable
          testID="start-datetime-button"
          accessibilityRole="button"
          accessibilityLabel={`Ride start, currently ${formatRideDateTime(start.toISOString())}. Tap to change.`}
          style={[styles.input, styles.dateButton]}
          onPress={openPicker}>
          <Text style={styles.inputText}>
            {formatRideDateTime(start.toISOString())}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
        {showPicker ? (
          <DateTimePicker
            testID="start-datetime-picker"
            value={pendingDate ?? start}
            mode={Platform.OS === 'ios' ? 'datetime' : pickerMode}
            onValueChange={handleDateSelected}
            onDismiss={closePicker}
          />
        ) : null}

        {errors.length > 0 ? (
          <Text
            testID="form-error"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.error}>
            {errors.join('\n')}
          </Text>
        ) : null}
        {createdTitle ? (
          <Text
            testID="form-success"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={styles.success}>
            Ride &ldquo;{createdTitle}&rdquo; created.
          </Text>
        ) : null}

        <View style={styles.spacer} />
        <AppButton title="Create ride" onPress={handleCreate} />
        <View style={styles.spacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginVertical: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  helper: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.xs,
    padding: spacing.sm,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    color: colors.text,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
  },
  multiline: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  option: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: '#fff',
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3261E',
    marginTop: spacing.sm,
  },
  success: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B8737',
    marginTop: spacing.sm,
  },
  spacer: {
    height: spacing.md,
  },
});
