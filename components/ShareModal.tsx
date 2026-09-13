"use client";

import { useEffect, useId, useRef } from "react";

import type { DocumentPerson } from "@/lib/document-types";

type ShareModalProps = {
  open: boolean;
  title: string;
  people: DocumentPerson[];
  shareTarget: { id: string; name: string; email: string } | null;
  alreadyShared: boolean;
  sharing: boolean;
  removingId: string | null;
  message: { type: "success" | "error" | "info"; text: string } | null;
  onClose: () => void;
  onShare: () => void;
  onRemove: (userId: string) => void;
};

export function ShareModal({
  open,
  title,
  people,
  shareTarget,
  alreadyShared,
  sharing,
  removingId,
  message,
  onClose,
  onShare,
  onRemove,
}: ShareModalProps) {
  const headingId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close share dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative z-10 max-h-[min(32rem,90vh)] w-full max-w-md overflow-y-auto rounded-xl border border-zinc-200 bg-white p-5 shadow-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={headingId} className="text-lg font-semibold text-zinc-900">
              Share
            </h2>
            <p className="mt-1 truncate text-sm text-zinc-500">{title}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            Close
          </button>
        </div>

        <section className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            People with access
          </h3>
          <ul className="mt-2 divide-y divide-zinc-100">
            {people.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{person.name}</p>
                  <p className="truncate text-xs text-zinc-500">{person.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={
                      person.role === "owner"
                        ? "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
                        : "rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800"
                    }
                  >
                    {person.role === "owner" ? "Owner" : "Editor"}
                  </span>
                  {person.role === "editor" ? (
                    <button
                      type="button"
                      onClick={() => onRemove(person.id)}
                      disabled={removingId === person.id}
                      title="Remove access"
                      className="rounded-md px-1.5 py-0.5 text-xs text-zinc-400 hover:bg-zinc-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50"
                    >
                      {removingId === person.id ? "Removing…" : "Remove"}
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 border-t border-zinc-100 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Share with
          </h3>
          {shareTarget ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{shareTarget.name}</p>
                <p className="truncate text-xs text-zinc-500">{shareTarget.email}</p>
              </div>
              <button
                type="button"
                onClick={onShare}
                disabled={sharing || alreadyShared}
                className="inline-flex h-9 shrink-0 items-center rounded-md bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sharing ? "Sharing…" : alreadyShared ? "Shared" : "Share"}
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">No other seeded user to share with.</p>
          )}
        </section>

        {message ? (
          <p
            role="status"
            className={
              message.type === "error"
                ? "mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800"
                : message.type === "success"
                  ? "mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                  : "mt-4 rounded-md bg-zinc-50 px-3 py-2 text-sm text-zinc-600"
            }
          >
            {message.text}
          </p>
        ) : null}
      </div>
    </div>
  );
}
