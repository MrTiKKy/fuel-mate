import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { getSql } from "@/lib/db/neon";

/**
 * Auth choice: Auth.js (NextAuth v5) + Credentials (email/password).
 * Session user.id === public.users.id (stable, used as user_id everywhere).
 * No OAuth required; maps cleanly onto the existing Neon `users` table.
 */

const credentialsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(200),
  name: z.string().trim().max(100).optional(),
  mode: z.enum(["login", "signup"]).default("login"),
});

export type AppSessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

async function findUserByEmail(email: string) {
  const sql = getSql();
  const rows = await sql`
    select id, email, name, image, password_hash as "passwordHash"
    from users
    where lower(email) = lower(${email})
    limit 1
  `;
  return rows[0] as
    | {
        id: string;
        email: string;
        name: string | null;
        image: string | null;
        passwordHash: string | null;
      }
    | undefined;
}

async function createUser(input: {
  email: string;
  name?: string;
  password: string;
}) {
  const sql = getSql();
  const id = crypto.randomUUID();
  const passwordHash = await hash(input.password, 10);
  const rows = await sql`
    insert into users (id, email, name, password_hash, created_at, updated_at)
    values (
      ${id},
      ${input.email.toLowerCase()},
      ${input.name ?? null},
      ${passwordHash},
      now(),
      now()
    )
    returning id, email, name
  `;
  return rows[0] as { id: string; email: string; name: string | null };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password, name, mode } = parsed.data;

        if (mode === "signup") {
          const existing = await findUserByEmail(email);
          if (existing) return null;
          const created = await createUser({ email, password, name });
          return {
            id: created.id,
            email: created.email,
            name: created.name,
          };
        }

        const user = await findUserByEmail(email);
        if (!user?.passwordHash) return null;
        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
      }
      return session;
    },
  },
});

/** Require a logged-in user; throws Response 401 when missing. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return userId;
}
