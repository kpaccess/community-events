import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gather – Community Events',
  description: 'Discover events, meet people, and build community.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
