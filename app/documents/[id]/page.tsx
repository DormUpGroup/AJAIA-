"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getDocumentAction } from "@/app/actions/documents";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { useMockUser } from "@/lib/auth/mock-user-context";
import type { DocumentEditorData } from "@/lib/document-types";

export default function DocumentPage() {
  const params = useParams<{ id: string }>();
  const { currentUser, isReady } = useMockUser();

  return (
    <div className="space-y-5">
      <Link
        href="/"
        className="inline-flex rounded-sm text-sm text-zinc-600 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
      >
        ← Back to documents
      </Link>

      {!isReady || !params.id ? (
        <div
          className="h-[32rem] animate-pulse rounded-xl bg-white shadow-sm"
          aria-busy="true"
          aria-label="Loading document"
        />
      ) : (
        <DocumentLoader
          key={`${currentUser.id}:${params.id}`}
          userId={currentUser.id}
          documentId={params.id}
        />
      )}
    </div>
  );
}

function DocumentLoader({
  userId,
  documentId,
}: {
  userId: string;
  documentId: string;
}) {
  const [editorData, setEditorData] = useState<DocumentEditorData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await getDocumentAction(userId, documentId);
      if (cancelled) {
        return;
      }
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setEditorData(result.data);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [documentId, userId]);

  if (loading) {
    return (
      <div
        className="h-[32rem] animate-pulse rounded-xl bg-white shadow-sm"
        aria-busy="true"
        aria-label="Loading document"
      />
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800"
      >
        <p className="font-medium">Can&apos;t open this document</p>
        <p className="mt-1 leading-6">{error}</p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-medium text-red-900 underline decoration-red-300 underline-offset-2 hover:decoration-red-900"
        >
          Back to documents
        </Link>
      </div>
    );
  }

  if (!editorData) {
    return null;
  }

  return (
    <DocumentEditor
      document={editorData.document}
      currentUserId={userId}
      ownerName={editorData.owner_name}
      isOwner={editorData.is_owner}
      initialPeople={editorData.people}
    />
  );
}
