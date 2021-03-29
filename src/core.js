import get from 'get-value';
import set from 'set-value';
import deepdiff from 'deep-diff';
import clonedeep from 'clone-deep';
import EventEmitter from './EventEmitter';

/**
 * Create a new xLogic instance.
 *
 * @param {Object} [initialState={}] Initial application state.
 */
export default function core(initialState = {}) {
  if (typeof initialState !== 'object') {
    throw new Error('Invalid initialState, aborting.');
  }

  const systems = {};
  const univerals = {};

  const context = initialState || {};

  const contextEventEmitter = new EventEmitter();
  const actionsEventEmitter = new EventEmitter();

  /**
  * ## Internal library function ##
  * -----------------------
  *
  * Remove a listener function.
  *
  * @param {Stirng} type Event type, must be one of "context", "actions"
  * @param {String} name Event name
  * @param {String} id Listener ID
  */
  function removeListener(type, name, id) {
    if (!type || typeof type !== 'string') {
      throw new Error('Invalid type passed to removeListener');
    }

    if (!name || typeof name !== 'string') {
      throw new Error('Invalid event name passed to removeListener');
    }

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid id passed to removeListener');
    }

    switch (type) {
      case 'context': contextEventEmitter.removeListener(name, id); return;
      case 'actions': actionsEventEmitter.removeListener(name, id); return;
      default: console.warn(`Invalid removeListener() type argument, "${type}"`); return;
    }
  }

  /**
   * ## Internal library function ##
   * -----------------------
   *
   * Subscribe to context updates.
   *
   * `path` is a dot-notation string that represents the portion
   * of the context that if changed, should triger the event listener.
   *
   * Listener is called with the updated value at this path.
   *
   * This function returns a unique id for this listener that can
   * be used later to unsubscribe from context updates.
   *
   * @param {String} path
   * @param {Function} listener
   * @return {String}
   */
  function addContextListener(path, listener) {
    return contextEventEmitter.addListener(path, listener);
  }

  /**
   * Remove a context listener.
   *
   * @param {String} path Context path
   * @param {String} id Listener ID
   */
  function removeContextListener(path, id) {
    removeListener('context', path, id);
  }

  /**
   * Add action event listeners within a system.
   * Will remove the listener if the system is removed.
   *
   * @param {String} name Name of the event to subscribe too (dot notation)
   * @param {Function} handler Event handler
   */
  function addSystemListener(systemId, name, handler) {
    if (!systemId || typeof systemId !== 'string') {
      throw new Error('Invalid id passed to addSystem');
    }

    if (!name || typeof name !== 'string') {
      throw new Error('Invalid name passed to system consume');
    }

    if (!handler || typeof handler !== 'function') {
      throw new Error('Invalid listener function passed to system consume');
    }

    if (!systems[systemId]) {
      throw new Error(`System "${systemId}" attempted to consume an event "${name}" but is no longer a registered system.`);
    }

    systems[systemId].actionListeners.push({
      name,
      id: actionsEventEmitter.addListener(name, handler),
    });
  }

  /**
   * Add a system.
   *
   * Upon being added, the system is called with an object containing the following values,
   * @property {Function} setContext Set the application context (see `setContext`)
   * @property {Function} emit Emit an application event (see `emitAction`)
   * @property {Function} consume Listen to application events (see `addSystemListener`)
   * @property {Function} univerals Call a univeral function (see `callUniversal`)
   *
   * @param {String} id Unique system id
   * @param {Function} system System function handler
   */
  function addSystem(id, system) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid id passed to addSystem');
    }

    if (!system || typeof system !== 'function') {
      throw new Error('Invalid system passed to addSystem');
    }

    if (systems[id]) {
      removeSystem(id);
    }

    systems[id] = {
      handler: system,
      actionListeners: [],
    };

    system({
      setContext,
      getContext,
      emit: emitAction,
      consume: (name, handler) => addSystemListener(id, name, handler),
      univerals: callUniversal,
    });
  }

  /**
   * Remove a system.
   * Will unregister all active listeners associated with this system.
   *
   * @param {String} id System id
   */
  function removeSystem(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid id passed to addSystem');
    }

    const system = systems[id];
    if (!system) {
      return;
    }

    const { actionListeners } = system;
    actionListeners.forEach(({ name, id }) => removeListener('actions', name, id));

    systems[id] = null;
    delete systems[id];
  }

  /**
  * ## Internal library function ##
  * -----------------------
  *
  * Remove a listener function.
  *
  * @param {Stirng} type Event type, must be one of "context", "actions"
  * @param {String} name Event name
  * @param {String} id Listener ID
  */
  function emit(type, name, ...payload) {
    switch (type) {
      case 'context': contextEventEmitter.emit(name, ...payload); return;
      case 'actions': actionsEventEmitter.emit(name, ...payload); return;
      default: console.warn(`Invalid emit() type argument, "${type}"`); return;
    }
  }

  /**
   * ## Internal library function ##
   * -----------------------
   *
   * Emit a context changed event.
   *
   * @param {String} path Context path
   * @param {*} value Updated context value for this path
   */
  function emitContextChange(path, value) {
    emit('context', path, value);
  }

  /**
   * Emit an application event
   *
   * @param {String} name Event name
   * @param {...*} payload Event payload
   */
  function emitAction(name, ...payload) {
    emit('actions', name, ...payload);
  }

  /**
   * Set the application context.
   * For best performance, be as specific as possible in the path.
   * Use multiple setContext calls if necessary.
   *
   * @param {String} path Dot-notation path of the context to access
   * @param {Function} setter Callback function that is given the context at this given path,
   *                          expected to return the updated value for this path.
   */
  function setContext(path, setter) {
    if (!path || typeof path !== 'string' || !path.trim().length) {
      throw new Error(`Invalid path "${path}" passed to setContext`);
    }

    if (!setter || typeof setter !== 'function') {
      throw new Error('Invalid setter function passed to setContext');
    }

    const targetContext = get(context, path);
    const referenceContext = clonedeep(targetContext);

    const updatedContext = setter(referenceContext);
    set(context, path, updatedContext);

    const diff = deepdiff(referenceContext, updatedContext);

    if (!diff || !diff.length) {
      return;
    }

    const previousLevels = path.split('.').reduce((acc, level, index, parts) => [
      ...acc,
      parts.slice(0, index + 1).join('.').replace(/\.$/, ''),
    ], []).filter((level) => !!level);

    const updatedLevels = diff
      .filter(({ path: nestedPath }) => !!nestedPath)
      .map(({ path: nestedPath }) => `${path}.${nestedPath.join('.')}`);

    let affectedLevels = [...updatedLevels, ...previousLevels]
      .filter((level) => contextEventEmitter.hasListeners(level));

    if (
      typeof diff[0].lhs === 'object'
      && (typeof diff[0].rhs !== 'object' || diff[0].rhs === null)
    ) {
      affectedLevels = affectedLevels.concat(
        contextEventEmitter.activeEvents.filter((eventPath) =>
          eventPath.includes(path) && !affectedLevels.includes(eventPath)
        )
      );
    }

    const updatedReferenceContext = getContext();
    affectedLevels.forEach((level) =>
      emitContextChange(level, get(updatedReferenceContext, level)));
  }

  /**
   * Get the application context.
   *
   * @return {Object}
   */
  function getContext() {
    return clonedeep(context);
  }

  function addUniversal(name, handler) {

  }

  function removeUniversal(name, handler) {

  }

  function callUniversal(name, ...parameters) {

  }

  return {
    addContextListener,
    removeContextListener,
    addSystem,
    removeSystem,
    emit: emitAction,
    setContext,
    getContext,
    addUniversal,
    removeUniversal,
    univerals: callUniversal,
  }
}
