"use client";

import { Header } from "@/components/Header";
import { MockUserProvider } from "@/lib/auth/mock-user-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MockUserProvider>
      <div className="flex min-h-full flex-col bg-zinc-100 text-zinc-900">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </MockUserProvider>
  );
}
