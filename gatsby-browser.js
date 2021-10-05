/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/browser-apis/
 */

// You can delete this file if you're not using it
import './src/styles/global.css';

import React from 'react';
import ProviderComposer from './src/contexts';

export const wrapRootElement = ({element}) => {
  <ProviderComposer>{element}</ProviderComposer>
};
