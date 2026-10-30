/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { installFetchMock } from './fixtures';

let restoreFetch: () => void;

beforeEach(() => {
  restoreFetch = installFetchMock();
});

afterEach(() => {
  restoreFetch();
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
