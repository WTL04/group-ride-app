import React from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/ScreenContainer';
import { RideCard } from '../components/RideCard';
import { mockRides } from '../data/mockRides';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Rides'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function RidesScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <Text style={styles.heading}>All rides</Text>
      <FlatList
        data={mockRides}
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
