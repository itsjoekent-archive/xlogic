import React from 'react';

export function useX({
  bind,
  register,
}) {
  const core = useContext(StateLibContext);
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    const hasBinds = Array.isArray(bind) && !!bind.length;

    if (hasBinds) {
      const listeners = bind.map((path) => core.listenForStateChange(path, ({ value, signature }) => {
        // check if we handled this signature already,
        // stack in a ref?
        console.log(path, value, signature);
        // setLocalState...
      }));

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

  return {
    context: localState,
    ...core.publicApi,
  };
}
