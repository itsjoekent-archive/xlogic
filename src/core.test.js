import core from './core';

describe('Core', () => {
  it('should initialize the core with no default state', () => {
    const app = core();

    expect(app).toStrictEqual(expect.objectContaining({
      listenForStateChange: expect.any(Function),
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
});
