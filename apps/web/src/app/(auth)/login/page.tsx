'use client';

import { OAuthButton } from './OAuthButton';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Todo List</h1>
      <OAuthButton />
    </main>
  );
}
