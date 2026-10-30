import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { formatRideDateTime } from '../lib/formatRideDate';
import { SELF_RIDER, useRides } from '../store/RidesContext';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;

export function RideDetailsScreen({ route }: Props) {
  const { rides, joinRide } = useRides();
  const ride = rides.find(r => r.id === route.params.rideId);

  if (!ride) {
    return (
      <ScreenContainer>
        <Text>Ride not found.</Text>
      </ScreenContainer>
    );
  }

  const joined = ride.riders.includes(SELF_RIDER);
  const full = ride.riders.length >= ride.maxRiders;
  const joinTitle = joined ? "You're in" : full ? 'Ride full' : 'Join ride';

  return (
    <ScreenContainer>
      <Text style={styles.title}>{ride.title}</Text>
      <Text style={styles.meta}>
        {formatRideDateTime(ride.startDateTime)} • {ride.distance} {ride.distanceUnit} • {ride.difficulty}
      </Text>
      <Text style={styles.meta}>
        Route: {ride.startLocation} → {ride.endLocation}
      </Text>
      <Text style={styles.meta}>
        Riders: {ride.riders.length}/{ride.maxRiders}
        {full ? ' • Full' : ''}
      </Text>
      {ride.avgPace !== null ? (
        <Text style={styles.meta}>
          Avg pace: {ride.avgPace} min/{ride.distanceUnit}
        </Text>
      ) : null}
      {ride.description ? (
        <>
          <View style={styles.spacer} />
          <Text style={styles.body}>{ride.description}</Text>
        </>
      ) : null}
      <View style={styles.spacer} />
      <AppButton
        title={joinTitle}
        disabled={joined || full}
        onPress={() => {
          joinRide(ride.id);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  body: {
    fontSize: 15,
    color: colors.text,
  },
  spacer: {
    height: spacing.md,
  },
});
