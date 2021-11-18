import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

interface TokenFormat {
  username: string;
  access_token: string;
  refresh_token: string;
  access_exp: number;
  refresh_exp: number;
}

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: "custom provider",
      credentials: {
        username: { label: "username", type: "text", placeholder: "username" },
        password: { label: "password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        const response: TokenFormat = await fetch('http://localhost:8080/auth/login', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({userid: credentials.username, password: credentials.password}),
        }).then(res => res.json());
        return {
          ...response,
          username: credentials.username
        }
      }
    })
  ],
  session: {
    jwt: true
  },
  callbacks: {
    redirect(url) {
      let baseUrl = 'http://localhost:4200';
      console.log('url: ', url);
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
    async jwt(token, user) {
      if (user) {
        return {
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          accessExpire: user.refresh_exp,
          refreshExpire: user.refresh_exp,
          username: user.username,
        }
      }
      return token;
    },
    async session(session, token) {
      session.user.name = token.username as string;
      session.error = null;
      return session
    }
  }
});