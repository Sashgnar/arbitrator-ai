import './globals.css';

export const metadata = {
  title: 'Arbitrator AI',
  description: 'AI-powered dispute resolution between two parties',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
