import React, { Ref } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { AppButton } from '../AppButton';
import { formatRideDateTime } from '../../lib/formatRideDate';
import type { RouteValue } from '../RoutePicker';
import { colors, spacing } from '../../theme';
import {
  DIFFICULTIES,
  DISTANCE_UNITS,
  Difficulty,
  DistanceUnit,
  MAX_DESCRIPTION_LENGTH,
  MAX_RIDERS_LIMIT,
  MAX_TEXT_LENGTH,
} from '../../types';

interface Props {
  sheetRef: Ref<BottomSheet>;
  onSnap: (index: number) => void;
  title: string;
  onTitle: (v: string) => void;
  startLocation: string;
  onStartLocation: (v: string) => void;
  endLocation: string;
  onEndLocation: (v: string) => void;
  distance: string;
  onDistance: (v: string) => void;
  distanceUnit: DistanceUnit;
  onUnit: (u: DistanceUnit) => void;
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  avgPace: string;
  onAvgPace: (v: string) => void;
  maxRiders: string;
  onMaxRiders: (v: string) => void;
  description: string;
  onDescription: (v: string) => void;
  start: Date;
  onOpenPicker: () => void;
  showPicker: boolean;
  pickerMode: 'date' | 'time';
  pendingDate: Date | null;
  onDateSelected: (event: DateTimePickerChangeEvent, date: Date) => void;
  onClosePicker: () => void;
  route: RouteValue;
  errors: string[];
  createdTitle: string;
  onCreate: () => void;
}

export function RideFormSheet(props: Props) {
  const {
    sheetRef,
    onSnap,
    title,
    onTitle,
    startLocation,
    onStartLocation,
    endLocation,
    onEndLocation,
    distance,
    onDistance,
    distanceUnit,
    onUnit,
    difficulty,
    onDifficulty,
    avgPace,
    onAvgPace,
    maxRiders,
    onMaxRiders,
    description,
    onDescription,
    start,
    onOpenPicker,
    showPicker,
    pickerMode,
    pendingDate,
    onDateSelected,
    onClosePicker,
    errors,
    createdTitle,
    onCreate,
  } = props;

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={['12%', '50%', '92%']}
      onChange={onSnap}
      keyboardBehavior="extend"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose={false}
      backgroundStyle={styles.sheet}
      handleIndicatorStyle={styles.handle}>
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Create a ride</Text>

        <Text style={styles.label}>Title</Text>
        <BottomSheetTextInput
          testID="title-input"
          accessibilityLabel="Ride title"
          style={styles.input}
          value={title}
          onChangeText={onTitle}
          placeholder="Saturday Morning Loop"
          maxLength={MAX_TEXT_LENGTH}
        />

        <Text style={styles.label}>Starts</Text>
        <Pressable
          testID="start-datetime-button"
          accessibilityRole="button"
          accessibilityLabel={`Ride start, currently ${formatRideDateTime(start.toISOString())}. Tap to change.`}
          style={[styles.input, styles.dateButton]}
          onPress={onOpenPicker}>
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
            onValueChange={onDateSelected}
            onDismiss={onClosePicker}
          />
        ) : null}

        <Text style={styles.label}>Start location</Text>
        <BottomSheetTextInput
          testID="start-location-input"
          accessibilityLabel="Ride start location"
          style={styles.input}
          value={startLocation}
          onChangeText={onStartLocation}
          placeholder="Central Park"
          maxLength={MAX_TEXT_LENGTH}
        />

        <Text style={styles.label}>End location</Text>
        <BottomSheetTextInput
          testID="end-location-input"
          accessibilityLabel="Ride end location"
          style={styles.input}
          value={endLocation}
          onChangeText={onEndLocation}
          placeholder="Riverside Cafe"
          maxLength={MAX_TEXT_LENGTH}
        />

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
              onPress={() => onUnit(unit)}>
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
        <BottomSheetTextInput
          testID="distance-input"
          accessibilityLabel={`Ride distance in ${distanceUnit}`}
          style={styles.input}
          value={distance}
          onChangeText={onDistance}
          placeholder="25"
          keyboardType="decimal-pad"
        />
        <Text style={styles.helper}>Numbers only, e.g. 25 or 25.5.</Text>

        <Text style={styles.label}>
          Average pace (min/{distanceUnit}, optional)
        </Text>
        <BottomSheetTextInput
          testID="avg-pace-input"
          accessibilityLabel={`Average pace in minutes per ${distanceUnit}, optional`}
          style={styles.input}
          value={avgPace}
          onChangeText={onAvgPace}
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
              onPress={() => onDifficulty(level)}>
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
        <BottomSheetTextInput
          testID="max-riders-input"
          accessibilityLabel="Maximum number of riders"
          style={styles.input}
          value={maxRiders}
          onChangeText={onMaxRiders}
          placeholder="10"
          keyboardType="number-pad"
          maxLength={3}
        />

        <Text style={styles.label}>Description (optional)</Text>
        <BottomSheetTextInput
          testID="description-input"
          accessibilityLabel="Ride description, optional"
          style={[styles.input, styles.multiline]}
          value={description}
          onChangeText={onDescription}
          placeholder="No-drop ride, regroup at the top of each climb."
          multiline
          numberOfLines={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
        <Text style={styles.helper}>
          Up to {MAX_DESCRIPTION_LENGTH} characters.
        </Text>

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
        <AppButton title="Create ride" onPress={onCreate} />
        <View style={styles.spacer} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.background },
  handle: { backgroundColor: colors.primary, width: 40 },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
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
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputText: { fontSize: 16, color: colors.text },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: { fontSize: 20, color: colors.primary },
  multiline: { minHeight: 76, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  option: {
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  optionSelected: { backgroundColor: colors.primary },
  optionText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  optionTextSelected: { color: '#fff' },
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
  spacer: { height: spacing.md },
});
