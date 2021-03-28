import core from './core';

describe('Core', () => {
  it('should initialize the core with no default state', () => {
    const app = core();

    expect(app).toStrictEqual(expect.objectContaining({
      addContextListener: expect.any(Function),
      addSystem: expect.any(Function),
      removeSystem: expect.any(Function),
      setContext: expect.any(Function),
      getContext: expect.any(Function),
      addUniversal: expect.any(Function),
      removeUniversal: expect.any(Function),
      univerals: expect.any(Function),
    }));
  });

  it('should not initialize the core with invalid default state', () => {
    expect(() => core(false)).toThrow();
  });

  it('should initialize the core with default state', () => {
    const app = core({ test: true });
    expect(app.getContext()).toStrictEqual({ test: true });
  });

  it('should return immutable context', () => {
    const app = core({ test: true });
    expect(app.getContext()).toStrictEqual({ test: true });
    app.getContext().test = false;
    expect(app.getContext()).toStrictEqual({ test: true });
  });

  it('should not add a system missing an id', () => {
    const app = core();
    expect(() => app.addSystem()).toThrow();
    expect(() => app.addSystem(false)).toThrow();
  });

  it('should not add a system missing a handler function', () => {
    const app = core();
    expect(() => app.addSystem('test')).toThrow();
    expect(() => app.addSystem('test', true)).toThrow();
  });

  it('should add a system that is called with the system api', () => {
    const app = core();
    const testSystem = jest.fn();

    app.addSystem('test', testSystem);

    expect(testSystem).toHaveBeenCalledWith(expect.objectContaining({
      consume: expect.any(Function),
      emit: expect.any(Function),
      setContext: expect.any(Function),
      getContext: expect.any(Function),
      univerals: expect.any(Function),
    }));
  });

  it('should let me add add a system event listener, emit an event, and remove the listener', () => {
    const app = core();
    const listener = jest.fn();

    app.addSystem('test', ({ consume }) => consume('broadcast', listener));
    app.emit('broadcast', { test: true }, 1);

    expect(listener).toHaveBeenCalledWith({ test: true }, 1);

    app.removeSystem('test');
    app.emit('broadcast', { test: true }, 1);

    expect(listener.mock.calls.length).toBe(1);
  });

  it('should replace a system if already registered', () => {
    const app = core();
    const firstListener = jest.fn();
    const secondListener = jest.fn();

    app.addSystem('test', ({ consume }) => consume('broadcast', firstListener));
    app.emit('broadcast', { test: true }, 1);

    expect(firstListener).toHaveBeenCalledWith({ test: true }, 1);

    app.addSystem('test', ({ consume }) => consume('broadcast', secondListener));
    app.emit('broadcast', { test: true }, 1);

    expect(firstListener.mock.calls.length).toBe(1);
    expect(secondListener).toHaveBeenCalledWith({ test: true }, 1);
  });

  it('should not add a context change listener missing a path', () => {
    const app = core();
    expect(() => app.addContextListener()).toThrow();
    expect(() => app.addContextListener('')).toThrow();
    expect(() => app.addContextListener(false)).toThrow();
    expect(() => app.addContextListener(() => {})).toThrow();
  });

  it('should not add a context change listener missing an event handler', () => {
    const app = core();
    expect(() => app.addContextListener('test')).toThrow();
    expect(() => app.addContextListener('test', true)).toThrow();
  });

  it('should not set context if missing path', () => {
    const app = core();
    expect(() => app.setContext()).toThrow();
    expect(() => app.setContext('')).toThrow();
    expect(() => app.setContext(true)).toThrow();
    expect(() => app.setContext(() => {})).toThrow();
  });

  it('should not set context if missing setter', () => {
    const app = core();
    expect(() => app.setContext('test')).toThrow();
    expect(() => app.setContext('test', true)).toThrow();
  });

  it('should add a context change listener and recieve updates', () => {
    const app = core({
      one: {},
      foo: {},
    });

    const levelOneListener = jest.fn();
    const levelTwoListener = jest.fn();
    const levelThreeListener = jest.fn();
    const heyListener = jest.fn();
    const fooListener = jest.fn();

    app.addContextListener('one', levelOneListener);
    app.addContextListener('one.hey', heyListener);
    app.addContextListener('one.two', levelTwoListener);
    app.addContextListener('one.two.three', levelThreeListener);
    app.addContextListener('foo', fooListener);

    app.setContext('one', (context) => ({
      ...context,
      hey: 'xLogic',
      two: {
        test: [true],
      },
    }));

    expect(levelOneListener.mock.calls.length).toBe(1);
    expect(levelOneListener.mock.calls[0][1]).toStrictEqual({
      hey: 'xLogic',
      two: {
        test: [true],
      },
    });

    expect(heyListener.mock.calls.length).toBe(1);
    expect(heyListener.mock.calls[0][1]).toEqual('xLogic');

    expect(levelTwoListener.mock.calls.length).toBe(1);
    expect(levelTwoListener.mock.calls[0][1]).toStrictEqual({
      test: [true],
    });

    expect(levelOneListener.mock.calls[0][0])
      .toEqual(levelTwoListener.mock.calls[0][0]);

    expect(levelThreeListener.mock.calls.length).toBe(0);
    expect(fooListener.mock.calls.length).toBe(0);

    app.setContext('one', (context) => ({
      ...context,
      hey: 'xLogic 2',
    }));

    expect(levelOneListener.mock.calls.length).toBe(2);
    expect(levelOneListener.mock.calls[1][1]).toStrictEqual({
      hey: 'xLogic 2',
      two: {
        test: [true],
      },
    });

    expect(heyListener.mock.calls.length).toBe(2);
    expect(heyListener.mock.calls[1][1]).toEqual('xLogic 2');

    expect(levelTwoListener.mock.calls.length).toBe(1);
    expect(levelThreeListener.mock.calls.length).toBe(0);
    expect(fooListener.mock.calls.length).toBe(0);

    app.setContext('one.two.three', () => 3);

    expect(levelOneListener.mock.calls.length).toBe(3);
    expect(levelOneListener.mock.calls[2][1]).toStrictEqual({
      hey: 'xLogic 2',
      two: {
        test: [true],
        three: 3,
      },
    });

    expect(levelTwoListener.mock.calls.length).toBe(2);
    expect(levelTwoListener.mock.calls[1][1]).toStrictEqual({
      test: [true],
      three: 3,
    });

    expect(levelOneListener.mock.calls[1][0])
      .not.toEqual(levelTwoListener.mock.calls[1][0]);

    expect(levelOneListener.mock.calls[2][0])
      .toEqual(levelTwoListener.mock.calls[1][0]);

    expect(levelThreeListener.mock.calls.length).toBe(1);
    expect(levelThreeListener.mock.calls[0][1]).toEqual(3);

    expect(heyListener.mock.calls.length).toBe(2);
    expect(fooListener.mock.calls.length).toBe(0);
  });

  it('should return undefined to the context listener if the parent object is nullified', () => {
    const app = core({ test: { hi: 'xLogic' } });
    const listener = jest.fn();
    app.addContextListener('test.hi', listener);
    app.setContext('test', () => null);
    expect(listener.mock.calls[0][1]).toBeUndefined();
  });

  it('should return undefined to the context listener if the parent object is set to a different type', () => {
    const app = core({ test: { hi: 'xLogic' } });
    const listener = jest.fn();
    app.addContextListener('test.hi', listener);
    app.setContext('test', () => 1);
    expect(listener.mock.calls[0][1]).toBeUndefined();
  });

  it('should work for deeply nested objects', () => {
    const app = core({ a: { b: { c: { d: { e: { hello: 'xLogic' } } } } } });
    const listener = jest.fn();
    app.addContextListener('a.b.c.d.e.hello', listener);

    app.setContext('a.b.c.d.e.hello', () => 'xLogic 2');
    expect(listener.mock.calls[0][1]).toBe('xLogic 2');

    app.setContext('a.b', () => ({
      c: {
        d: null,
      },
    }));

    expect(listener.mock.calls[1][1]).toBeUndefined();
  });

  it('should recognize type changes at the path level', () => {
    const app = core({ test: { hi: 'xLogic' } });
    const listener = jest.fn();
    app.addContextListener('test', listener);
    app.setContext('test', () => true);
    expect(listener.mock.calls[0][1]).toBe(true);
  });

  it('should not trigger unnecessary context events', () => {
    const app = core({ test: { hi: 'xLogic' } });
    const listener = jest.fn();

    const listenerId = app.addContextListener('test', listener);
    app.setContext('test', () => true);
    expect(listener.mock.calls.length).toBe(1);

    app.setContext('test', () => true);
    expect(listener.mock.calls.length).toBe(1);
  });

  it('should remove a context listener', () => {
    const app = core({ test: { hi: 'xLogic' } });
    const listener = jest.fn();

    const listenerId = app.addContextListener('test', listener);
    app.setContext('test', () => true);
    expect(listener.mock.calls.length).toBe(1);

    app.removeContextListener('test', listenerId);
    app.setContext('test', () => false);
    expect(listener.mock.calls.length).toBe(1);
  });
});
