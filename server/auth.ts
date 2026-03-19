import { getServerSession, NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users } from "./db/roles";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt"
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "email", placeholder: "email" },
                password: { label: "password", type: "password", placeholder: "password" }
            },
            async authorize(credentials) {
                const user = await db.query.users.findFirst({
                    where: eq(users.email, credentials?.email ?? "")
                });

                if (!user) {
                    throw new Error("Invalid email or password");
                }

                const isPasswordCorrect = await bcrypt.compare(credentials?.password ?? "", user.hashedPassword);

                if (!isPasswordCorrect) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user.id,
                    role: user.role,
                    email: user.email,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "USER";
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
};

export const getAuthServerSession = () => getServerSession(authOptions);