import React, { cloneElement } from 'react';
import { AuthProvider } from './auth';

const ProviderComposer: React.FC<{
  contexts: Array<any>
}> = ({ contexts, children }) => {
  return contexts.reduce((kids, parent) => cloneElement(parent, { children: kids }), children);
};

export default ({ children }) => {
  return (
    <ProviderComposer contexts={[<AuthProvider />]}>
      {children}
    </ProviderComposer>
  );
};
