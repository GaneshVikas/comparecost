import './globals.css';

export const metadata = {
  title: 'CompareCost — Cost of Living Comparison',
  description: 'Compare cost of living, salaries, and economy between any two countries. Built for students and expats.',
  keywords: 'cost of living, salary comparison, currency, expat, student, international',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
