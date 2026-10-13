import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/prisma/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma as any),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            id: "demo",
            name: "Demo",
            credentials: {},

            async authorize() {
                const demoUser = await prisma.user.upsert({
                    where: { email: "demo@excel-ui.demo" },
                    update: {},
                    create: {
                        email: "demo@excel-ui.demo",
                        name: "Usuario Demo",
                    },
                });

                return {
                    id: demoUser.id,
                    name: demoUser.name,
                    email: demoUser.email,
                    image: demoUser.image,
                };
            },
        }),
    ],

    session: {
        strategy: "database",
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/",
    },
};
