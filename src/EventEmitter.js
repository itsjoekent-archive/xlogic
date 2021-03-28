import { nanoid } from 'nanoid';

/**
 * Simple events machine.
 *
 * Differentiates from the common Node `events` module as
 * it relies on each listener having an id instead of
 * adding/removing based on stack order.
 */
export default function EventEmitter() {
  const listeners = {};
  const activeEvents = [];

  /**
   * Add an event listener function.
   *
   * @param {String} name Event name
   * @param {Function} listener Event handler
   * @return {String}
   */
  function addListener(name, listener) {
    if (!name || typeof name !== 'string') {
      throw new Error('Missing listener name');
    }

    if (!listener || typeof listener !== 'function') {
      throw new Error('Missing listener function handler');
    }

    if (!listeners[name]) {
      listeners[name] = {};
    }

    const id = nanoid();
    listeners[name][id] = listener;

    if (!activeEvents.includes(name)) {
      activeEvents.push(name);
    }

    return id;
  }

  /**
   * Remove an event listener.
   *
   * @param {String} name Event name
   * @param {String} id Listener id
   */
  function removeListener(name, id) {
    if (!name || typeof name !== 'string') {
      throw new Error('Missing listener name');
    }

    if (!id || typeof id !== 'string') {
      throw new Error('Missing listener id');
    }

    listeners[name][id] = null;
    delete listeners[name][id];

    if (!hasListeners(name) && activeEvents.includes(name)) {
      activeEvents.splice(activeEvents.indexOf(name), 1);
    }
  }

  /**
   * Check if the given event has 1 or more listeners.
   *
   * @param {String} name Event name
   * @return {Boolean}
   */
  function hasListeners(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Missing listener name');
    }

    return activeEvents.includes(name);
  }

  /**
   * Emit an event to all subscribed listeners.
   *
   * @param {String} name Event name
   * @param {...*} payload Optional event payload
   */
  function emit(name, ...payload) {
    if (!name || typeof name !== 'string') {
      throw new Error('Missing listener name');
    }

    Object.values(listeners[name] || {}).forEach((listener) => {
      if (typeof listener === 'function') {
        listener(...payload);
      }
    });
  }

  return {
    addListener,
    removeListener,
    hasListeners,
    emit,
    activeEvents,
  }
}
