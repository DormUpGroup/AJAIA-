"use client";

import { useMockUser } from "@/lib/auth/mock-user-context";

export function UserSwitcher() {
  const { currentUser, setCurrentUserId, users, isReady } = useMockUser();

  if (!isReady) {
    return (
      <div className="h-10 w-56 animate-pulse rounded-md bg-zinc-100" aria-hidden />
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="hidden min-w-0 text-right sm:block">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          Demo user
        </p>
        <p className="truncate text-sm font-medium text-zinc-900">{currentUser.name}</p>
      </div>
      <label className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-xs font-medium text-zinc-500 sm:sr-only">
          Switch user
        </span>
        <select
          className="h-9 min-w-0 max-w-[14rem] rounded-md border border-zinc-300 bg-white px-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 sm:min-w-[12.5rem]"
          value={currentUser.id}
          onChange={(event) => setCurrentUserId(event.target.value)}
          aria-label="Switch demo user"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
