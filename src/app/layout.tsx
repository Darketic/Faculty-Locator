import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Faculty Locator | Manipal University Jaipur',
  description:
    'Academic faculty directory, live cabin availability, and floor locator for Manipal University Jaipur.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-100 selection:text-brand-900">
        {children}
      </body>
    </html>
  );
}
