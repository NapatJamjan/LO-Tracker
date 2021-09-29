import * as React from 'react';
import { Link } from 'gatsby';
import { StaticImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import Seo from '../components/seo';

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <StaticImage
      src="../images/gatsby-astronaut.png"
      width={300}
      quality={95}
      formats={['auto', 'webp', 'avif']}
      alt="A Gatsby astronaut"
      style={{ marginBottom: `1.45rem` }}
    />
    <p>
      <Link to="/page-2/">Go to page 2</Link> <br />
      <Link to="/using-typescript/">Go to "Using TypeScript"</Link>
    </p>
    <div>
      <p className="text-purple-700 text-opacity-100 ...">The quick brown fox ...</p>
      <p className="text-purple-700 text-opacity-75 ...">The quick brown fox ...</p>
      <p className="text-purple-700 text-opacity-50 ...">The quick brown fox ...</p>
      <p className="text-purple-700 text-opacity-25 ...">The quick brown fox ...</p>
      <p className="text-purple-700 text-opacity-0 ...">The quick brown fox ...</p>
    </div>
  </Layout>
);

export default IndexPage;
