import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import axios from 'axios';
import React, { createContext, useState } from 'react';

interface AuthContent {
  isSignedIn: () => boolean;
  login: (userid: string, password: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContent>({
  isSignedIn: () => false,
  login: (userid: string, password: string) => { },
  logout: () => { }
});

interface AuthState {
  username: string | null
}

interface Token {
  access_token: string;
  refresh_token: string;
  access_exp: number;
  refresh_exp: number;
}

const initialToken: Token = {
  access_token: '',
  refresh_token: '',
  access_exp: 0,
  refresh_exp: 0
}

const api = axios.create({
  baseURL: 'http://localhost:8080/auth'
});

export const AuthProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<Token>(initialToken);

  const isSignedIn = () => token.access_token !== '';
  const login = (userid: string, password: string) => api.post<Token>('login', { userid, password }).then(res => res.data).then(setToken);
  const logout = () => setToken(initialToken);
  
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token.access_token}`,
      }
    }
  });
  const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
    uri: 'http://localhost:8080/query',
    cache: new InMemoryCache()
  });

  return (
    <AuthContext.Provider value={{ isSignedIn, login, logout }}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
    </AuthContext.Provider>
  );
};