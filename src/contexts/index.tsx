import React, { cloneElement } from 'react';

const ProviderComposer: React.FC<{
    contexts: Array<any>
  }> = ({contexts, children}) => {
  return contexts.reduce((kids, parent) => cloneElement(parent, {children: kids}), children);
};

export default ({children}) => {
  return (
    <ProviderComposer contexts={[]}>
      {children}
    </ProviderComposer>
  );
};
