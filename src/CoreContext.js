import React from 'react';

export const CoreContext = React.createContext({});

if (process.env.NODE_ENV !== 'production') {
  CoreContext.displayName = 'xLogic';
}

export default CoreContext;
