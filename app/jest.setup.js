jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({ children }) => children,
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return function MockDateTimePicker(props) {
    return React.createElement('View', { testID: props.testID });
  };
});

jest.mock('@maplibre/maplibre-react-native', () => {
  const React = require('react');
  const mock = props =>
    React.createElement('View', { testID: props.testID }, props.children);
  return {
    Map: mock,
    Camera: () => null,
    Marker: () => null,
    GeoJSONSource: mock,
    Layer: () => null,
  };
});

jest.mock(
  '@env',
  () => ({ STADIA_API_KEY: '' }),
  { virtual: true },
);
