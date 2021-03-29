import React from 'react';
import CoreContext from './CoreContext';

export default function CoreProvider(props) {
  const { core, children = null } = props;

  if (!core || !core.__xLogicCore) {
    throw new Error('Invalid xLogic core passed to XProvider');
  }

  return (
    <CoreContext.Provider value={core}>
      {children}
    </CoreContext.Provider>
  );
}
