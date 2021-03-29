import EventEmitter from '../src/EventEmitter';

describe('EventEmitter', () => {
  it('Creates a new event machine', () => {
    const emitter = new EventEmitter();

    expect(emitter).toStrictEqual(expect.objectContaining({
      addListener: expect.any(Function),
      removeListener: expect.any(Function),
      emit: expect.any(Function),
      activeEvents: expect.any(Array),
    }));
  });

  it('Does not accept a listener missing a name', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.addListener('', () => {})).toThrow();
    expect(() => emitter.addListener(null, () => {})).toThrow();
    expect(() => emitter.addListener(true, () => {})).toThrow();
    expect(() => emitter.addListener(1, () => {})).toThrow();
  });

  it('Does not accept a listener missing a handler function', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.addListener('test')).toThrow();
    expect(() => emitter.addListener('test', null)).toThrow();
    expect(() => emitter.addListener('test', true)).toThrow();
  });

  it('Returns a unique id for the listener', () => {
    const emitter = new EventEmitter();
    const id = emitter.addListener('test', () => {});
    expect(id).toHaveLength(21);
  });

  it('Does not accept an event missing a name', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit()).toThrow();
    expect(() => emitter.emit('')).toThrow();
    expect(() => emitter.emit(null)).toThrow();
    expect(() => emitter.emit(true)).toThrow();
  });

  it('Adds a listener and recieves an event', () => {
    const listener = jest.fn();
    const emitter = new EventEmitter();
    emitter.addListener('test', listener);
    emitter.emit('test');
    expect(listener).toHaveBeenCalled();
  });

  it('Adds a listener and recieves an event with a payload', () => {
    const listener = jest.fn();
    const emitter = new EventEmitter();
    emitter.addListener('test', listener);
    emitter.emit('test', { foo: 'bar' });
    expect(listener).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('Adds a listener and recieves an event payload with many arguments', () => {
    const listener = jest.fn();
    const emitter = new EventEmitter();
    emitter.addListener('test', listener);
    emitter.emit('test', { foo: 'bar' }, 1);
    expect(listener).toHaveBeenCalledWith({ foo: 'bar' }, 1);
  });

  it('Single event calls multiple listeners', () => {
    const listeners = [
      jest.fn(),
      jest.fn(),
      jest.fn(),
    ];

    const emitter = new EventEmitter();

    emitter.addListener('test', listeners[0]);
    emitter.addListener('test', listeners[1]);
    emitter.addListener('other', listeners[2]);

    emitter.emit('test');
    expect(listeners[0]).toHaveBeenCalled();
    expect(listeners[1]).toHaveBeenCalled();
    expect(listeners[2]).not.toHaveBeenCalled();
  });

  it('Removes an event listener', () => {
    const listener = jest.fn();
    const emitter = new EventEmitter();
    const id = emitter.addListener('test', listener);
    emitter.removeListener('test', id);
    emitter.emit('test');
    expect(listener).not.toHaveBeenCalled();
  });

  it('Does not check for listeners if missing name', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.hasListeners('')).toThrow();
    expect(() => emitter.hasListeners(true)).toThrow();
    expect(() => emitter.hasListeners()).toThrow();
  });

  it('Checks if the event has listeners', () => {
    const emitter = new EventEmitter();
    expect(emitter.hasListeners('test')).toBe(false);
    emitter.addListener('test', () => {});
    expect(emitter.hasListeners('test')).toBe(true);
    expect(emitter.activeEvents).toStrictEqual(['test']);
  });
});
