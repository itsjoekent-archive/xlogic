import React from 'react';
import LRU from 'lru-cache';
import clonedeep from 'clone-deep';
import set from 'set-value';
import CoreContext from './CoreContext';

export function useCore({
  bind,
  register,
}) {
  const core = React.useContext(CoreContext);
  const [localState, setLocalState] = React.useState({});
  const signatureCache = React.useRef(new LRU({ max: 50, maxAge: 1000 * 10 }));

  function onContextUpdateGenerator(path) {
    function onContextUpdate(signature, value) {
      if (!!signatureCache.current.get(signature)) {
        return;
      }

      signatureCache.current.set(signature, true);

      setLocalState((state) => {
        const updatedState = clonedeep(state);
        set(updatedState, path, value);

        return updatedState;
      });
    }
  }

  useEffect(() => {
    const hasBinds = Array.isArray(bind) && !!bind.length;

    if (hasBinds) {
      const listeners = bind.map((path) => (
        core.addContextListener(path, onContextUpdateGenerator(path)
      ));

      return () => listeners.forEach((id) => core.removeListener('state', id));
    }
  }, [
    bind,
  ]);

  useEffect(() => {
    const hasRegisters = Array.isArray(register) && !!register.length;

    if (hasRegisters) {
      const systems = register.map((system) => core.addSystem(system));
      return () => systems.forEach((systemId) => core.removeSystem(systemId));
    }
  }, [
    register,
  ]);

  useEffect(() => signatureCache.current.reset(), []);

  return {
    context: localState,
    ...core.publicApi,
  };
}
