import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password wajib diisi');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('Email tidak terdaftar');
        }

        if (user.isBanned) {
          throw new Error('Akun Anda telah diblokir');
        }

        if (!user.passwordHash) {
          throw new Error('Gunakan metode login yang sesuai');
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          throw new Error('Password salah');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatar,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;

        // Check if user exists
        let dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (!dbUser) {
          // Create new user
          const username = email.split('@')[0] + Math.random().toString(36).substring(2, 5);
          const referralCode = `${username.toUpperCase().substring(0, 4)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

          dbUser = await prisma.user.create({
            data: {
              email,
              username,
              avatar: user.image,
              referralCode,
            },
          });
        }

        // Update last login
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        });

        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email || '' },
          select: {
            id: true,
            username: true,
            avatar: true,
            balance: true,
            kycStatus: true,
            isAdmin: true,
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.username = dbUser.username;
          token.avatar = dbUser.avatar;
          token.balance = Number(dbUser.balance);
          token.kycStatus = dbUser.kycStatus;
          token.isAdmin = dbUser.isAdmin;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string | null;
        session.user.balance = token.balance as number;
        session.user.kycStatus = token.kycStatus as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
