import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import core from '../src/core';
import CoreProvider from '../src/CoreProvider';

describe('CoreProvider', () => {
  let container = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  it('should throw an error if an improper core prop is supplied', () => {
    const _error = console.error;
    console.error = () => {};

    expect(() => {
      act(() => {
        render(<CoreProvider />, container);
      });
    }).toThrow();

    expect(() => {
      act(() => {
        render(<CoreProvider core={{}} />, container);
      });
    }).toThrow();

    expect(() => {
      act(() => {
        render(<CoreProvider core={{ setContext: () => {} }} />, container);
      });
    }).toThrow();

    console.error = _error;
  });

  it('should render children within the provider', () => {
    const app = core();

    act(() => {
      render((
        <CoreProvider core={app}>
          <h1 id="hello">xLogic</h1>
        </CoreProvider>
      ), container);
    });

    expect(container.querySelector('#hello').textContent).toBe('xLogic');
  });
});
