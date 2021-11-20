import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

interface TokenFormat {
  username: string;
  email: string;
  access_token: string;
  refresh_token: string;
  access_exp: number;
  refresh_exp: number;
  is_teacher: boolean;
  role_level: number;
}

interface ErrorFormat {
  error: string;
}

export default NextAuth({
  providers: [
    Credentials({
      name: "custom provider",
      credentials: {
        username: { label: "username", type: "text", placeholder: "username" },
        password: { label: "password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        const response = await fetch('http://localhost:8080/auth/login', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({userid: credentials.username, password: credentials.password}),
        });
        if (!response.ok || response.status >= 400) {
          const err: ErrorFormat = await response.json();
          throw err.error;
        }
        const token: TokenFormat = await response.json()
        return {
          ...token,
          id: credentials.username,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: 'jwt------secret',
  },
  callbacks: {
    redirect({url}) {
      let baseUrl = 'http://localhost:4200';
      if (url.startsWith(baseUrl)) return url;
      else if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
    async jwt({token, user}) {
      if (user) {
        return {
          accessToken: user.access_token,
          refreshToken: user.refresh_token,
          accessExpire: user.refresh_exp,
          refreshExpire: user.refresh_exp,
          isTeacher: user.is_teacher,
          roleLevel: user.role_level,
          username: user.username,
          email: user.email,
          id: user.id,
        };
      }
      return token;
    },
    async session({session, token}) {
      session.user.name = token.username as string;
      session.user.email = token.email as string;
      session.isTeacher = token.isTeacher as boolean;
      session.roleLevel = token.roleLevel as number;
      session.id = token.id as string;
      session.error = null;
      console.log(session);
      return session;
    }
  }
});