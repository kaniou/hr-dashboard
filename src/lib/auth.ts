import NextAuth from "next-auth";
import type { NextAuthConfig, DefaultSession, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { OAuth2Config } from "@auth/core/providers";
import { customFetch } from "@auth/core";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STAFF" | "EXECUTIVE" | "ADMIN";
      faculty: string | null;
      provider: "kku";
    } & DefaultSession["user"];
    accessToken: string;
    expiresAt: number;
  }

  interface User {
    role: "STAFF" | "EXECUTIVE" | "ADMIN";
    faculty: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STAFF" | "EXECUTIVE" | "ADMIN";
    faculty: string | null;
    provider: "kku";
    accessToken: string;
    expiresAt: number;
  }
}

const VALID_ROLES = new Set<string>(["STAFF", "EXECUTIVE", "ADMIN"]);

function mapKKURole(raw: string | undefined): "STAFF" | "EXECUTIVE" | "ADMIN" {
  if (!raw) return "STAFF";
  const upper = raw.toUpperCase();
  if (VALID_ROLES.has(upper)) return upper as "STAFF" | "EXECUTIVE" | "ADMIN";
  return "STAFF";
}

const KKUSSOProvider: OAuth2Config<Record<string, unknown>> = {
  id: "kku",
  name: "KKU SSO",
  type: "oauth",
  issuer: "https://sso-uat-web.kku.ac.th",
  checks: ["none"],
  clientId: process.env.KKU_CLIENT_ID!,
  clientSecret: process.env.KKU_CLIENT_SECRET!,
  authorization: {
    url: "https://sso-uat-web.kku.ac.th/login",
    params: {
      app: process.env.KKU_APP_ID!,
      response_type: "code",
      redirect_uri: process.env.KKU_REDIRECT_URL!,
    },
  },
  token: process.env.KKU_TOKEN_URL!,
  profile(profile) {
    const empId = (
      (profile as Record<string, unknown>).employeeId ??
      (profile as Record<string, unknown>).citizenId ??
      (profile as Record<string, unknown>).sub
    ) as string | undefined;

    return {
      id: String(empId ?? ""),
      name: `${String((profile as Record<string, unknown>).firstName ?? "")} ${String((profile as Record<string, unknown>).lastName ?? "")}`.trim(),
      email: String(profile.email ?? ""),
      role: mapKKURole((profile as Record<string, unknown>).role as string),
      faculty: null,
    };
  },
};

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [KKUSSOProvider],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "kku") {
        if (!user.email) return false;

        // Access is granted only to accounts registered in the User table.
        // The custom /auth/callback route handles KKU SSO; this guard simply
        // prevents the standard OAuth callback from auto-creating accounts.
        const existing = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true },
        });
        if (!existing) return false;

        return true;
      }
      return false;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id!;
        token.role = (user.role as "STAFF" | "EXECUTIVE" | "ADMIN") ?? "STAFF";
        token.faculty = user.faculty ?? null;
        token.provider = "kku";
      }
      if (account) {
        token.accessToken = account.access_token!;
        token.expiresAt = account.expires_at ?? 0;
        token.provider = "kku";
      }

      // The User table is the authority for access control. Refresh role and
      // faculty on every session read so ADMIN changes apply immediately.
      const userId = token.id ?? token.sub;
      const email = token.email;

      let dbUser = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, faculty: true },
          })
        : null;

      if (!dbUser && email) {
        dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, role: true, faculty: true },
        });
      }

      if (!dbUser) return null;

      token.id = dbUser.id;
      token.role = dbUser.role as "STAFF" | "EXECUTIVE" | "ADMIN";
      token.faculty = dbUser.faculty;
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.faculty = token.faculty;
        session.user.provider = token.provider;
      }
      session.accessToken = token.accessToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
 
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// ─── Guard helpers for Server Components ──

export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return session?.user != null;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

export async function hasRole(minRole: "STAFF" | "EXECUTIVE" | "ADMIN"): Promise<boolean> {
  const hierarchy: Record<string, number> = { STAFF: 0, EXECUTIVE: 1, ADMIN: 2 };
  const session = await auth();
  const userLevel = hierarchy[session?.user?.role ?? ""] ?? -1;
  return userLevel >= hierarchy[minRole];
}

export async function isKKUUser(): Promise<boolean> {
  const session = await auth();
  return session?.user?.provider === "kku";
}
