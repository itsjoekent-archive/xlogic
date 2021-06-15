import React from 'react';
import { render, screen } from '@testing-library/react'
import core from '../src/core';
import CoreProvider from '../src/CoreProvider';
import useCore from '../src/useCore';

describe('CoreProvider', () => {
  it('should subscribe to state updates', () => {
    const app = core({ a: { b: { c: { d: 'hello' } } } });

    function TestComponent() {
      return <p data-testid="test">hello</p>
      // const { context } = useCore({ bind: ['a.b.c.d'] });
      // return <p data-testid="test">{context.a.b.c.d}</p>
    }

    const { unmount } = render(
      <CoreProvider core={app}>
        <TestComponent />
      </CoreProvider>
    );

    expect(screen.getByText('hello')).toBeValid();

    app.setContext('a.b', () => ({ c: { d: 'hello 2' } }));

    expect(screen.queryByTestId('test')).toBe('hello 2');

    unmount();
  });
});
