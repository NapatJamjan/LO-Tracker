import { AppProps } from 'next/app'
import 'react-toastify/dist/ReactToastify.css'
import 'rc-collapse/assets/index.css'
import './styles.css'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../utils/apollo-client'
import { SessionProvider } from 'next-auth/react'
import SiteLayout from '../components/SiteLayout'
import { PageTransition } from 'next-page-transitions'

function MyApp({ Component, pageProps: {session, ...pageProps}, router }: AppProps) {
  const client = useApollo(pageProps);
  return <ApolloProvider client={client}>
    <SessionProvider session={session} refetchInterval={10 * 60}>
      <SiteLayout>
        <PageTransition
          timeout={160}
          classNames="page-transition"
          loadingComponent={<p>Loading...</p>}
          loadingDelay={200}
          loadingTimeout={{
            enter: 160,
            exit: 0,
          }}
          loadingClassNames="loading-indicator">
            <Component {...pageProps} key={router.route}/>
        </PageTransition>
        <style jsx global>{`
          .page-transition-enter {
            opacity: 0;
          }
          .page-transition-enter-active {
            opacity: 1;
            transition: opacity 160ms;
          }
          .page-transition-exit {
            opacity: 1;
          }
          .page-transition-exit-active {
            opacity: 0;
            transition: opacity 160ms;
          }
        `}</style>
      </SiteLayout>
    </SessionProvider>
  </ApolloProvider>;
}

export default MyApp;
