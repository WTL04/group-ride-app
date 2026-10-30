/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RideDetailsScreen } from '../src/screens/RideDetailsScreen';
import { RideCard } from '../src/components/RideCard';
import { RidesProvider } from '../src/store/RidesContext';
import { fixtureRides } from './fixtures';

const METRICS = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function detailTexts(renderer: ReactTestRenderer.ReactTestRenderer): string {
  return renderer.root
    .findByType(RideDetailsScreen)
    .findAllByType(Text)
    .map(t => String(t.props.children))
    .join(' ');
}

async function renderDetails(rideId: string, initialRides = fixtureRides) {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <RidesProvider initialRides={initialRides}>
          <RideDetailsScreen
            route={{ key: 'k', name: 'RideDetails', params: { rideId } }}
            navigation={{} as any}
          />
        </RidesProvider>
      </SafeAreaProvider>,
    );
  });
  return renderer!;
}

test('join adds you to the roster and confirms', async () => {
  const renderer = await renderDetails('1');
  expect(detailTexts(renderer)).toMatch(/Riders: ,2,\/,10/);

  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ title: 'Join ride' }).props.onPress();
  });

  expect(detailTexts(renderer)).toMatch(/Riders: ,3,\/,10/);
  expect(detailTexts(renderer)).toMatch(/You/);
  expect(
    renderer.root.findByProps({ title: "You're in" }),
  ).toBeTruthy();
});

test('joining twice does not duplicate you', async () => {
  const renderer = await renderDetails('1');

  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ title: 'Join ride' }).props.onPress();
  });
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ title: "You're in" }).props.onPress();
  });

  expect(detailTexts(renderer)).toMatch(/Riders: ,3,\/,10/);
});

test('a full ride cannot be joined and says so', async () => {
  const fullRide = {
    ...fixtureRides[0],
    riders: Array.from({ length: 10 }, (_, i) => `R${i}`),
  };
  const renderer = await renderDetails(fullRide.id, [fullRide, ...fixtureRides.slice(1)]);

  expect(detailTexts(renderer)).toMatch(/Ride full/);
  await ReactTestRenderer.act(() => {
    renderer.root.findByProps({ title: 'Ride full' }).props.onPress();
  });
  expect(detailTexts(renderer)).toMatch(/Riders: ,10,\/,10/);
});

test('a full ride card carries the full signal', async () => {
  const fullRide = {
    ...fixtureRides[0],
    riders: Array.from({ length: 10 }, (_, i) => `R${i}`),
  };
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <RideCard ride={fullRide} onPress={() => {}} />
      </SafeAreaProvider>,
    );
  });
  const joined = renderer!.root
    .findAllByType(Text)
    .map(t => String(t.props.children))
    .join(' ');
  expect(joined).toMatch(/Full/);
});
