import React from 'react';
import CoreContext from './CoreContext';

export default function CoreProvider(props) {
  const { core, children } = props;

  return (
    <CoreContext.Provider value={core}>
      {children}
    </CoreContext.Provider>
  );
}
