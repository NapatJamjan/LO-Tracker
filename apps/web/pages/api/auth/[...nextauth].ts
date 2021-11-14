import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.Credentials({
      name: "custom provider",
      credentials: {
        username: { label: "username", type: "text", placeholder: "username" },
        password: { label: "password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        return {
          name: credentials.username
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
    async jwt(token, user, account) {
      if (account && user) {
        return {
          accessToken: 'access',
          refreshToken: 'refresh',
          accessExpire: 0,
          refreshExpire: 0,
          username: user.name,
        }
      }
      return token;
    },
    async session(session, token) {
      return {
        user: {
          name: token.username as string
        },
        error: null
      };
    }
  }
});