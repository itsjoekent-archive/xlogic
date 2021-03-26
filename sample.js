function Hero(props, context, emit) {
  return {
    markup: (
      <header>
        <h1>{props.title}</h1>
        <p>{props.subtitle}</p>
        {!!context.content.cta && (
          <button onClick={emit('cta-click')}>
            {context.content.cta}
          </button>
        )}
      </header>
    ),
    bind: ['content.cta'],
  }
}

async function initializeContent({ setContext, singletons }) {
  try {
    const content = await singletons('fetch')('...', { ... });
    setContext('content', content);
  } catch (error) {
    singletons('reportError')(error);
    setContext('content.hasFailedToLoad', true);
  }
}

async function handleCtaClick({ consume, emit }) {
  consume('cta-click', (event) => {
    event.preventDefault();
    emit('@package-modal/trigger', { type: 'signup', ... });
  });
}


/* --------------------------- */

async function formSubmit({ consume }) {
  // ...
}

async function formOnChange({ consume, setContext }) {
  // ...
}

function Form(props, context, emit) {
  const { formName } = props;
  const { email, password } = context.forms || {};

  function onChangeGenerator(fieldName) {
    function onChange(event) {
      emit('form-input-onChange', { fieldName, event });
    }

    return onChange;
  }

  return {
    markup: (
      <form onSubmit={(event) => emit(`form-submit`, { event, formName })}>
        <input
          type="email"
          value={email || ''}
          onChange={onChangeGenerator('email')}
        />
        <input
          type="password"
          value={password || ''}
          onChange={onChangeGenerator('password')}
        />
        <button type="submit">submit</button>
      </form>
    ),
    bind: [
      `forms.${formName}`,
    ],
    systems: [
      formSubmit,
      formOnChange,
    ],
  }
}


/* --------------------------- */


export function useStateLib({
  bind,
  register,
}) {
  const core = useContext(StateLibContext);
  const [localState, setLocalState] = useState({});

  useEffect(() => {
    const hasBinds = Array.isArray(bind) && !!bind.length;

    if (hasBinds) {
      bind.forEach((key) => core.on(key, (value) => {
        setLocalState...
      }));

      return () => {
        bind.forEach((key) => core.removeListener('bind', key, setLocalState));
      };
    }
  }, [
    bind,
  ]);

  useEffect(() => {
    const hasRegisters = Array.isArray(register) && !!register.length;

    if (hasRegisters) {
      const systems = register.map((system) => {
        system.__id = `${Date.now()}${Math.round(Math.random())}`;
        return system;
      });

      systems.forEach((system) => core.addSystem(system));

      return () => {
        systems.forEach((system) => core.removeSystem(system));
      };
    }
  }, [
    register,
  ]);

  return {
    context: localState,
    ...core.publicApi,
  };
}

function Hero(props) {
  const { context, emit } = useStateLib({
    bind: ['content.cta'],
  });

  return (
    <header>
      <h1>{props.title}</h1>
      <p>{props.subtitle}</p>
      {!!context.content.cta && (
        <button onClick={emit('cta-click')}>
          {context.content.cta}
        </button>
      )}
    </header>
  );
}

async function initializeContent({ setState, singletons }) {
  try {
    const content = await singletons('fetch')('...', { ... });
    setState('content', content);
  } catch (error) {
    singletons('reportError')(error);
    setState('content.hasFailedToLoad', true);
  }
}

async function handleCtaClick({ consume, emit }) {
  consume('cta-click', (event) => {
    event.preventDefault();
    emit('@package-modal/trigger', { type: 'signup', ... });
  });
}

// Something else to think about...
// "dependsOn" --> key in the hook argument
// Can have a system that listens for a `dependsOn` event
// Does the data fetch and sets the context
//
// Also need to work through the setup api, systems client vs ssr, systems threads (webworkers)?
