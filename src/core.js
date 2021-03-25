import EventEmitter from './EventEmitter';

export default function core() {
  const univerals = {};
  const systems = {};

  const stateEventEmitter = new EventEmitter();
  const actionsEventEmitter = new EventEmitter();

  /**
   * ## Internal function ##
   * -----------------------
   *
   * Subscribe to state updates.
   *
   * `path` is a dot-notation string that represents the portion
   * of the state that if changed, should triger the event listener.
   * The path can either be specific or use a wildcard ("*").
   *
   * Listener is called with two parameters,
   *  value<any>, signature<String>
   *
   * `value` is the updated value at this state path.
   * `signature` is a unique id representing this state update.
   * Given that multiple events can fire for the same state change,
   * the signature allows subscribers to avoid unnecessary work.
   *
   * This function returns a unique id for this listener that can
   * be used later to unsubscribe from state updates.
   *
   * @param {String} path
   * @param {Function} listener
   * @return {String}
   */
  function listenForStateChange(path, listener) {
    return stateEventEmitter.addListener(path, id, listener);
  }

  function removeListener(type, id) {
    switch (type) {
      case 'state': stateEventEmitter.removeListener(id); return;
      case 'actions': actionsEventEmitter.removeListener(id); return;
      default: console.warn(`Invalid removeListener() type argument, "${type}"`); return;
    }
  }

  function addSystem(system) {

  }

  function removeSystem(id) {

  }

  function emit(type, name, payload) {

  }

  function emitStateChange(path, value) {

  }

  function addUniversal(id, handler) {

  }

  return {
    listenForStateChange,
    removeListener,
    addSystem,
    removeSystem,
    emit,
    univerals,
    publicApi: {
      emit,
      univerals,
    },
  }
}
