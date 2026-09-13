"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { DocumentList } from "@/components/DocumentList";
import { UploadTxtButton } from "@/components/UploadTxtButton";
import {
  createDocumentAction,
  listDashboardDocumentsAction,
} from "@/app/actions/documents";
import { useMockUser } from "@/lib/auth/mock-user-context";
import type { DocumentListItem } from "@/lib/document-types";

export function Dashboard() {
  const router = useRouter();
  const { currentUser, isReady } = useMockUser();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setCreateError(null);

    const result = await createDocumentAction(currentUser.id);
    if ("error" in result) {
      setCreateError(result.error);
      setCreating(false);
      return;
    }

    router.push(`/documents/${result.data.id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Documents</h1>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-zinc-600">
            Create, edit, and share documents with your team.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row">
            <UploadTxtButton
              userId={currentUser.id}
              disabled={!isReady || creating}
              onError={setCreateError}
            />
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!isReady || creating}
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating…" : "New Document"}
            </button>
          </div>
          <p className="text-xs leading-5 text-zinc-500">.txt only, max 1 MB</p>
        </div>
      </div>

      {createError ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {createError}
        </div>
      ) : null}

      {!isReady ? (
        <DashboardSkeleton />
      ) : (
        <DashboardLists key={currentUser.id} userId={currentUser.id} />
      )}
    </div>
  );
}

function DashboardLists({ userId }: { userId: string }) {
  const [owned, setOwned] = useState<DocumentListItem[]>([]);
  const [shared, setShared] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      const result = await listDashboardDocumentsAction(userId);
      if (cancelled) {
        return;
      }

      if ("error" in result) {
        setOwned([]);
        setShared([]);
        setError(result.error);
        setLoading(false);
        return;
      }

      setOwned(result.data.owned);
      setShared(result.data.shared);
      setError(null);
      setLoading(false);
    }

    void loadDocuments();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-10">
      {error ? (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      ) : null}
      <DocumentList
        title="Owned by me"
        emptyMessage="No documents yet. Create one or upload a .txt file to get started."
        documents={owned}
        badge="Owned"
      />
      <DocumentList
        title="Shared with me"
        emptyMessage="Nothing shared with you yet. Share a document, then switch the demo user to test collaboration."
        documents={shared}
        badge="Shared"
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        <div className="h-6 w-36 animate-pulse rounded bg-zinc-200/80" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="h-24 animate-pulse rounded-xl bg-zinc-200/70" />
          <div className="h-24 animate-pulse rounded-xl bg-zinc-200/70" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200/80" />
        <div className="h-24 animate-pulse rounded-xl bg-zinc-200/70" />
      </div>
    </div>
  );
}
