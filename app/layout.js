import './globals.css';

export const metadata = {
  title: 'Supabase Test App',
  description: 'A simple app to test Supabase integration on Vercel',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
