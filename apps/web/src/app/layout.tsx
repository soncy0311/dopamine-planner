import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todo List',
  description: 'Todo List Application',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
