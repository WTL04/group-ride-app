import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { RideCard } from '../components/RideCard';
import { useRides } from '../store/RidesContext';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const { rides, loading, loadError } = useRides();
  if (loading) {
    return (
      <ScreenContainer>
        <Text style={styles.heading}>Loading rides…</Text>
      </ScreenContainer>
    );
  }
  return (
    <ScreenContainer>
      <Text style={styles.heading}>Upcoming rides</Text>
      {loadError ? <Text>{loadError}</Text> : null}
      <FlatList
        data={rides}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RideCard
            ride={item}
            onPress={() =>
              navigation.navigate('RideDetails', { rideId: item.id })
            }
          />
        )}
      />
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
});
