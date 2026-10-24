import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, spacing } from '../theme';

export function ProfileScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.body}>Name: Rider One</Text>
      <Text style={styles.body}>Rides joined: 0</Text>
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
  body: {
    fontSize: 15,
    color: colors.text,
    marginTop: spacing.xs,
  },
});
