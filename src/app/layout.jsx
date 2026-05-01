import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Gather – Community Events',
  description: 'Discover events, meet people, and build community.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
