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

jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  return {
    GestureHandlerRootView: ({ children, style }) =>
      React.createElement('View', { style }, children),
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const { forwardRef, useImperativeHandle } = React;
  const BottomSheet = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({ snapToIndex: jest.fn() }));
    return React.createElement('View', null, props.children);
  });
  const BottomSheetScrollView = props =>
    React.createElement('View', null, props.children);
  const BottomSheetTextInput = props =>
    React.createElement('View', { testID: props.testID });
  return { __esModule: true, default: BottomSheet, BottomSheet, BottomSheetScrollView, BottomSheetTextInput };
});
