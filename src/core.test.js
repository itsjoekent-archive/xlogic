import core from './core';

describe('Core', () => {
  it('should initialize the core with no default state', () => {
    const app = core();

    expect(app).toStrictEqual(expect.objectContaining({
      listenForContextChange: expect.any(Function),
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
    expect(() => app.listenForContextChange()).toThrow();
    expect(() => app.listenForContextChange('')).toThrow();
    expect(() => app.listenForContextChange(false)).toThrow();
    expect(() => app.listenForContextChange(() => {})).toThrow();
  });

  it('should not add a context change listener missing an event handler', () => {
    const app = core();
    expect(() => app.listenForContextChange('test')).toThrow();
    expect(() => app.listenForContextChange('test', true)).toThrow();
  });

  // set context error states

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

    app.listenForContextChange('one', levelOneListener);
    app.listenForContextChange('one.hey', heyListener);
    app.listenForContextChange('one.two', levelTwoListener);
    app.listenForContextChange('one.two.three', levelThreeListener);
    app.listenForContextChange('foo', fooListener);

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

  // deep nested check

  // remove state listener
});
