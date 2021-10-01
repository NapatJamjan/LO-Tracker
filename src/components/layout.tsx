/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import * as React from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';

import Header from './header';
import './layout.css';

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  return (
    <div className="min-h-screen flex flex-col w-100">
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />
      <main
        style={{
          maxWidth: 960,
          padding: `0.5rem 1.0875rem 1.45rem`
        }}
        className="mx-auto flex-grow w-screen"
      >
        {children}
      </main>
      <footer className="mx-auto py-3">Footer</footer>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
