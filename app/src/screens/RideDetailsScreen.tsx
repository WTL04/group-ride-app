import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { mockRides } from '../data/mockRides';
import { RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RideDetails'>;

export function RideDetailsScreen({ route }: Props) {
  const ride = mockRides.find(r => r.id === route.params.rideId);

  if (!ride) {
    return (
      <ScreenContainer>
        <Text>Ride not found.</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>{ride.title}</Text>
      <Text style={styles.meta}>
        {ride.date} • {ride.distanceKm} km
      </Text>
      <Text style={styles.meta}>Start: {ride.startLocation}</Text>
      <Text style={styles.meta}>
        Riders: {ride.riders.length}/{ride.maxRiders} • {ride.difficulty}
      </Text>
      <View style={styles.spacer} />
      <Text style={styles.body}>{ride.description}</Text>
      <View style={styles.spacer} />
      <AppButton title="Join ride" onPress={() => {}} />
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
