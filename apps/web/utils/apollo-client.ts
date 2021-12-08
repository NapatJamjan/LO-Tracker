import { useMemo } from 'react'
import { ApolloClient, createHttpLink, InMemoryCache, NormalizedCacheObject, from } from '@apollo/client'
import { concatPagination } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import merge from 'deepmerge'
import isEqual from 'lodash/isEqual'

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'

let apolloClient: ApolloClient<NormalizedCacheObject>
let accessToken = ''

function getHttpLink() {
  return createHttpLink({
    uri: process.env.GRAPHQL_URL,
    credentials: 'include',
  })
}

function getAuthLink(token: string = '') {
  return setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: !!token?`Bearer ${token}`:'',
      }
    }
  })
}

function createApolloClient(token: string = '') {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([getAuthLink(token), getHttpLink()]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination(),
          },
        },
      },
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache'
      },
    },
  })
}

let count = 0

export function initializeApollo(token: string = '', initialState: NormalizedCacheObject = null) {
  const _apolloClient = token===''?null:createApolloClient(token)
  if (initialState && token !== '') {
    const existingCache = _apolloClient.extract()
    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    })
    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  if (typeof window === 'undefined') return _apolloClient
  if (!!_apolloClient) apolloClient = _apolloClient
  return apolloClient
}

export function addApolloState(client: ApolloClient<NormalizedCacheObject>, pageMetadatas) {
  if (pageMetadatas?.props) {
    pageMetadatas.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }
  return pageMetadatas
}

export function useApollo(pageProps, token: string) {
  const state: NormalizedCacheObject = pageProps[APOLLO_STATE_PROP_NAME]
  const store = initializeApollo(token, state)
  return store
}
