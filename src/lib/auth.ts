import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase-admin';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) return null;

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profile) return null;

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          image: null,
          role: profile.role,
          avatar: profile.avatar || '',
          bio: profile.bio || '',
          joinedAt: profile.joined_at,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') return true;
      if (!user.email) return false;

      const { data: existing } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', user.email.toLowerCase())
        .single();

      if (!existing) {
        const id = uuidv4();
        const nameParts = (user.name ?? user.email).trim().split(/\s+/);
        const avatar = nameParts.map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

        const { error } = await supabaseAdmin.from('profiles').insert({
          id,
          name: user.name ?? user.email.split('@')[0],
          email: user.email.toLowerCase(),
          role: 'member',
          bio: '',
          avatar,
        });

        if (error) return false;
        user.id = id;
      } else {
        user.id = existing.id;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const isCredentials = account?.provider === 'credentials';
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq(isCredentials ? 'id' : 'email', isCredentials ? user.id : user.email!)
          .single();

        if (profile) {
          token.userId = profile.id;
          token.role = profile.role;
          token.avatar = profile.avatar || '';
          token.bio = profile.bio || '';
          token.joinedAt = profile.joined_at;
          token.name = profile.name;
          token.email = profile.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = (token.role as 'admin' | 'member') ?? 'member';
      session.user.avatar = (token.avatar as string) ?? '';
      session.user.bio = (token.bio as string) ?? '';
      session.user.joinedAt = (token.joinedAt as string) ?? '';
      if (token.name) session.user.name = token.name as string;
      if (token.email) session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: { strategy: 'jwt' },
};
