/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { CreateRideScreen } from '../src/screens/CreateRideScreen';
import { RidesScreen } from '../src/screens/RidesScreen';
import { RideDetailsScreen } from '../src/screens/RideDetailsScreen';
import { RideCard } from '../src/components/RideCard';
import { AppButton } from '../src/components/AppButton';
import { RidesProvider } from '../src/store/RidesContext';
import { mockRides } from '../src/data/mockRides';

const METRICS = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

test('a created ride appears in the list with its route, pace, and description', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <RidesProvider>
          <CreateRideScreen />
          <RidesScreen navigation={{ navigate: jest.fn() } as any} route={{} as any} />
        </RidesProvider>
      </SafeAreaProvider>,
    );
  });
  const root = renderer!.root;
  const createNode = root.findByType(CreateRideScreen);

  await ReactTestRenderer.act(() => {
    createNode.findByProps({ testID: 'title-input' }).props.onChangeText('River Ramble');
    createNode.findByProps({ testID: 'start-location-input' }).props.onChangeText('Central Park');
    createNode.findByProps({ testID: 'end-location-input' }).props.onChangeText('Riverside Cafe');
    createNode.findByProps({ testID: 'distance-input' }).props.onChangeText('12');
    createNode.findByProps({ testID: 'avg-pace-input' }).props.onChangeText('');
    createNode.findByProps({ testID: 'max-riders-input' }).props.onChangeText('8');
    createNode.findByProps({ testID: 'description-input' }).props.onChangeText('Coffee stop halfway.');
  });
  await ReactTestRenderer.act(() => {
    createNode.findByType(AppButton).props.onPress();
  });

  const cards = root.findByType(RidesScreen).findAllByType(RideCard);
  expect(cards.length).toBe(mockRides.length + 1);
  const created = cards.find(c => c.props.ride.title === 'River Ramble')!;
  expect(created).toBeTruthy();
  const cardTexts = created
    .findAllByType(Text)
    .map(t => String(t.props.children));
  expect(cardTexts.join(' ')).toMatch(/Central Park/);
  expect(cardTexts.join(' ')).toMatch(/Riverside Cafe/);
  expect(cardTexts.join(' ')).toMatch(/Coffee stop halfway/);
  expect(cardTexts.join(' ')).not.toMatch(/Avg pace/);
});

test('a created ride renders in details with route, pace, and description', async () => {
  const navigation = { navigate: jest.fn() };
  const tree = (detailsId?: string) => (
    <SafeAreaProvider initialMetrics={METRICS}>
      <RidesProvider>
        <CreateRideScreen navigation={navigation as any} />
        {detailsId ? (
          <RideDetailsScreen
            route={{ key: 'k', name: 'RideDetails', params: { rideId: detailsId } }}
            navigation={{} as any}
          />
        ) : null}
      </RidesProvider>
    </SafeAreaProvider>
  );
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(tree());
  });
  const root = renderer!.root;

  await ReactTestRenderer.act(() => {
    root.findByProps({ testID: 'title-input' }).props.onChangeText('Hill Repeats');
    root.findByProps({ testID: 'start-location-input' }).props.onChangeText('North Trailhead');
    root.findByProps({ testID: 'end-location-input' }).props.onChangeText('Summit Overlook');
    root.findByProps({ testID: 'distance-input' }).props.onChangeText('30');
    root.findByProps({ testID: 'distance-unit-km' }).props.onPress();
    root.findByProps({ testID: 'avg-pace-input' }).props.onChangeText('4');
    root.findByProps({ testID: 'max-riders-input' }).props.onChangeText('6');
    root.findByProps({ testID: 'description-input' }).props.onChangeText('Regroup at the top.');
  });
  await ReactTestRenderer.act(() => {
    root.findByType(AppButton).props.onPress();
  });

  const createdId = navigation.navigate.mock.calls[0][1].rideId as string;
  await ReactTestRenderer.act(() => {
    renderer!.update(tree(createdId));
  });
  const detailTexts = renderer!.root
    .findByType(RideDetailsScreen)
    .findAllByType(Text)
    .map(t => String(t.props.children))
    .join(' ');
  expect(detailTexts).toMatch(/Hill Repeats/);
  expect(detailTexts).toMatch(/North Trailhead/);
  expect(detailTexts).toMatch(/Summit Overlook/);
  expect(detailTexts).toMatch(/Avg pace: ,4, min\/,km/);
  expect(detailTexts).toMatch(/Regroup at the top/);
});
