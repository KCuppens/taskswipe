import NextAuth from "next-auth"

// Lightweight auth configuration for Edge runtime (middleware)
// This avoids bundling Prisma and bcryptjs into the middleware
// Must match the session strategy and secret from main auth.ts
export const { auth: authEdge } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
