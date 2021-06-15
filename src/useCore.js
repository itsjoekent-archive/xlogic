import React from 'react';
import clonedeep from 'clone-deep';
import get from 'get-value';
import set from 'set-value';
import CoreContext from './CoreContext';

export default function useCore({
  bind,
  register,
}) {
  const core = React.useContext(CoreContext);

  function getInitialLocalState() {
    const initialContext = core.getContext();
    const initialLocalState = {};

    bind.forEach((path) => set(initialLocalState, path, get(initialContext, path)));
    return initialLocalState;
  }

  const [localState, setLocalState] = React.useState(getInitialLocalState());

  function onContextUpdateGenerator(path) {
    function onContextUpdate(value) {
      setLocalState((state) => {
        const updatedState = clonedeep(state);
        set(updatedState, path, value);

        return updatedState;
      });
    }

    return onContextUpdate;
  }

  React.useEffect(() => {
    const hasContextBinds = Array.isArray(bind) && !!bind.length;

    if (hasContextBinds) {
      const listeners = bind.map((path) => (
        core.addContextListener(path, onContextUpdateGenerator(path))
      ));

      setLocalState(getInitialLocalState());

      return () => listeners.forEach((id, index) => core.removeContextListener(bind[index], id));
    }
  }, [
    bind,
  ]);

  React.useEffect(() => {
    const hasSystemRegisters = Array.isArray(register) && !!register.length;

    if (hasSystemRegisters) {
      const systems = register.map((system) => core.addSystem(system));
      return () => systems.forEach((systemId) => core.removeSystem(systemId));
    }
  }, [
    register,
  ]);

  return {
    context: localState,
  };
}
