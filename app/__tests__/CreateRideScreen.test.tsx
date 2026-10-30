/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CreateRideScreen } from '../src/screens/CreateRideScreen';
import { AppButton } from '../src/components/AppButton';
import { RidesProvider } from '../src/store/RidesContext';
import { NewRide } from '../src/types';

const METRICS = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

interface SetupOptions {
  onCreate?: (ride: NewRide) => void;
  navigation?: { navigate: jest.Mock };
}

async function renderScreen({ onCreate, navigation }: SetupOptions = {}) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <RidesProvider>
          <CreateRideScreen
            onCreate={onCreate}
            navigation={navigation as any}
          />
        </RidesProvider>
      </SafeAreaProvider>,
    );
  });
  return renderer!;
}

function fill(root: ReactTestRenderer.ReactTestInstance, testID: string, value: string) {
  root.findByProps({ testID }).props.onChangeText(value);
}

async function fillValidForm(root: ReactTestRenderer.ReactTestInstance) {
  await ReactTestRenderer.act(() => {
    fill(root, 'title-input', 'Saturday Morning Loop');
    fill(root, 'start-location-input', 'Central Park');
    fill(root, 'end-location-input', 'Riverside Cafe');
    fill(root, 'distance-input', '25.5');
    fill(root, 'avg-pace-input', '6');
    fill(root, 'max-riders-input', '10');
    fill(root, 'description-input', 'No-drop ride.');
  });
}

async function submit(root: ReactTestRenderer.ReactTestInstance) {
  await ReactTestRenderer.act(() => {
    root.findByType(AppButton).props.onPress();
  });
}

function errorText(root: ReactTestRenderer.ReactTestInstance): string {
  return String(root.findByProps({ testID: 'form-error' }).props.children);
}

test('submits a ride draft with parsed values', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await ReactTestRenderer.act(() => {
    root.findByProps({ testID: 'difficulty-challenging' }).props.onPress();
    root.findByProps({ testID: 'distance-unit-km' }).props.onPress();
  });
  await submit(root);

  expect(onCreate).toHaveBeenCalledTimes(1);
  const draft: NewRide = onCreate.mock.calls[0][0];
  expect(draft.title).toBe('Saturday Morning Loop');
  expect(draft.startLocation).toBe('Central Park');
  expect(draft.endLocation).toBe('Riverside Cafe');
  expect(draft.distance).toBe(25.5);
  expect(draft.distanceUnit).toBe('km');
  expect(draft.difficulty).toBe('challenging');
  expect(draft.avgPace).toBe(6);
  expect(draft.maxRiders).toBe(10);
  expect(draft.description).toBe('No-drop ride.');
  expect(root.findByProps({ testID: 'form-success' })).toBeTruthy();
});

test('accepts a blank pace and blank description as skipped', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await ReactTestRenderer.act(() => {
    fill(root, 'title-input', 'Easy Spin');
    fill(root, 'start-location-input', 'Park');
    fill(root, 'end-location-input', 'Lake');
    fill(root, 'distance-input', '10');
    fill(root, 'avg-pace-input', '');
    fill(root, 'max-riders-input', '5');
    fill(root, 'description-input', '');
  });
  await submit(root);

  expect(onCreate).toHaveBeenCalledTimes(1);
  const draft: NewRide = onCreate.mock.calls[0][0];
  expect(draft.avgPace).toBeNull();
  expect(draft.description).toBe('');
});

test('rejects max riders above 50', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await ReactTestRenderer.act(() => {
    fill(root, 'max-riders-input', '51');
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  expect(errorText(root)).toMatch(/50/);
});

test('requires a title', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await ReactTestRenderer.act(() => {
    fill(root, 'title-input', '  ');
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  expect(root.findByProps({ testID: 'form-error' })).toBeTruthy();
});

test.each([
  ['distance-input', '15mph'],
  ['distance-input', '12.34.56'],
  ['distance-input', '12,5'],
  ['distance-input', '1e308'],
  ['avg-pace-input', '15mph'],
  ['avg-pace-input', '12,5'],
  ['avg-pace-input', 'abc'],
  ['max-riders-input', '0x10'],
  ['max-riders-input', '1e1'],
  ['max-riders-input', '0b10'],
  ['max-riders-input', '10.5'],
])('rejects %s value %s instead of silently coercing it', async (field, value) => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await ReactTestRenderer.act(() => {
    fill(root, field, value);
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  expect(root.findByProps({ testID: 'form-error' })).toBeTruthy();
});

test('rejects text longer than 50 characters set programmatically', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await ReactTestRenderer.act(() => {
    fill(root, 'title-input', 'b'.repeat(51));
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  expect(errorText(root)).toMatch(/50/);
});

test('rejects absurd magnitudes', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await ReactTestRenderer.act(() => {
    fill(root, 'distance-input', '1001');
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  expect(errorText(root)).toMatch(/1000/);
});

test('shows every problem in one submit, not one per round-trip', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await ReactTestRenderer.act(() => {
    fill(root, 'title-input', 'T');
    fill(root, 'start-location-input', 'S');
    fill(root, 'end-location-input', 'E');
    fill(root, 'distance-input', 'bad');
    fill(root, 'avg-pace-input', 'bad');
    fill(root, 'max-riders-input', '999');
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  const text = errorText(root);
  expect(text).toMatch(/Distance/);
  expect(text).toMatch(/Average pace/);
  expect(text).toMatch(/Max riders/);
});

test('clears the form after success so a second press cannot duplicate', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await submit(root);
  expect(onCreate).toHaveBeenCalledTimes(1);
  expect(root.findByProps({ testID: 'title-input' }).props.value).toBe('');

  await submit(root);
  expect(onCreate).toHaveBeenCalledTimes(1);
  expect(root.findByProps({ testID: 'form-error' })).toBeTruthy();
});

test('assigns a unique id per ride in the store', async () => {
  const navigation = { navigate: jest.fn() };
  const renderer = await renderScreen({ navigation });
  const root = renderer.root;

  await fillValidForm(root);
  await submit(root);
  await fillValidForm(root);
  await submit(root);

  expect(navigation.navigate).toHaveBeenCalledTimes(2);
  const [first, second] = navigation.navigate.mock.calls.map(
    c => c[1].rideId as string,
  );
  expect(first).toEqual(expect.any(String));
  expect(first).not.toBe(second);
});

test('navigates to the new ride details on success', async () => {
  const navigation = { navigate: jest.fn() };
  const renderer = await renderScreen({ navigation });
  const root = renderer.root;

  await fillValidForm(root);
  await submit(root);

  expect(navigation.navigate).toHaveBeenCalledTimes(1);
  expect(navigation.navigate).toHaveBeenCalledWith(
    'RideDetails',
    expect.objectContaining({ rideId: expect.any(String) }),
  );
});

test('stores a valid future startDateTime by default', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  await submit(root);

  expect(onCreate).toHaveBeenCalledTimes(1);
  const draft: NewRide = onCreate.mock.calls[0][0];
  expect(Number.isFinite(Date.parse(draft.startDateTime))).toBe(true);
  expect(new Date(draft.startDateTime).getTime()).toBeGreaterThan(Date.now());
});

test('stores the date chosen in the picker', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  const chosen = new Date(Date.now() + 48 * 3600 * 1000);
  await ReactTestRenderer.act(() => {
    root.findByProps({ testID: 'start-datetime-button' }).props.onPress();
  });
  await ReactTestRenderer.act(() => {
    root.findByProps({ testID: 'start-datetime-picker' }).props.onChange({ type: 'set' }, chosen);
  });
  await submit(root);

  expect(onCreate).toHaveBeenCalledTimes(1);
  const draft: NewRide = onCreate.mock.calls[0][0];
  expect(draft.startDateTime).toBe(chosen.toISOString());
});

test('rejects a start in the past', async () => {
  const onCreate = jest.fn();
  const renderer = await renderScreen({ onCreate });
  const root = renderer.root;

  await fillValidForm(root);
  const past = new Date(Date.now() - 48 * 3600 * 1000);
  await ReactTestRenderer.act(() => {
    root.findByProps({ testID: 'start-datetime-button' }).props.onPress();
  });
  await ReactTestRenderer.act(() => {
    root.findByProps({ testID: 'start-datetime-picker' }).props.onChange({ type: 'set' }, past);
  });
  await submit(root);

  expect(onCreate).not.toHaveBeenCalled();
  expect(errorText(root)).toMatch(/future/);
});
