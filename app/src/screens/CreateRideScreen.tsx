import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { AppButton } from '../components/AppButton';
import { colors, spacing } from '../theme';

export function CreateRideScreen() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');

  return (
    <ScreenContainer>
      <Text style={styles.heading}>Create a ride</Text>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Saturday Morning Loop"
      />
      <Text style={styles.label}>Start location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Central Park"
      />
      <View style={styles.spacer} />
      <AppButton title="Create ride" onPress={() => {}} />
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
  input: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.xs,
    padding: spacing.sm,
    fontSize: 16,
  },
  spacer: {
    height: spacing.md,
  },
});
