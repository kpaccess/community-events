import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Required in Next.js 14 App Router: NextAuth reads cookies/headers dynamically.
// Without this, the route may be statically optimised and return 500 on /api/auth/session.
export const dynamic = 'force-dynamic';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
