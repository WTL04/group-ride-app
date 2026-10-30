import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatRideDateTime } from '../lib/formatRideDate';
import { Ride } from '../types';
import { colors, spacing } from '../theme';

interface Props {
  ride: Ride;
  onPress: () => void;
}

export function RideCard({ ride, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{ride.title}</Text>
      <Text style={styles.meta}>
        {formatRideDateTime(ride.startDateTime)} • {ride.distance} {ride.distanceUnit} • {ride.difficulty}
      </Text>
      <Text style={styles.meta}>
        {ride.startLocation} → {ride.endLocation} • {ride.riders.length}/
        {ride.maxRiders} riders
      </Text>
      {ride.avgPace !== null ? (
        <Text style={styles.meta}>
          Avg pace {ride.avgPace} min/{ride.distanceUnit}
        </Text>
      ) : null}
      {ride.description ? (
        <>
          <View style={styles.spacer} />
          <Text numberOfLines={2} style={styles.desc}>
            {ride.description}
          </Text>
        </>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  spacer: {
    height: spacing.sm,
  },
  desc: {
    fontSize: 14,
    color: colors.text,
  },
});
