import { ApolloProvider } from '@apollo/client';
import { AppProps } from 'next/app';
import './styles.css'
import client from '../apollo-client';

function MyApp({ Component, pageProps }: AppProps) {
  return <ApolloProvider client={client}>
    <div className="min-h-screen flex flex-col w-100">
      <main
        style={{
          maxWidth: 960,
          padding: `0.5rem 1.0875rem 1.45rem`
        }}
        className="mx-auto flex-grow w-screen">
        <Component {...pageProps} />
      </main>
      <footer className="mx-auto py-3">Footer</footer>
    </div>
  </ApolloProvider>;
}

export default MyApp;
