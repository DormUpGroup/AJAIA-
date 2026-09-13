"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";

import {
  shareDocumentAction,
  unshareDocumentAction,
  updateDocumentAction,
} from "@/app/actions/documents";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { SaveIndicator, type SaveStatus } from "@/components/editor/SaveIndicator";
import { ShareModal } from "@/components/ShareModal";
import { MOCK_USERS } from "@/lib/auth/mock-users";
import { FALLBACK_DOCUMENT_TITLE, normalizeDocumentTitle } from "@/lib/document-title";
import type { DocumentPerson } from "@/lib/document-types";
import type { Document, Json } from "@/lib/supabase/types";
import { toEditorContent } from "@/lib/tiptap-doc";

const AUTOSAVE_DEBOUNCE_MS = 700;

type DocumentEditorProps = {
  document: Document;
  currentUserId: string;
  ownerName: string;
  isOwner: boolean;
  initialPeople: DocumentPerson[];
};

export function DocumentEditor({
  document,
  currentUserId,
  ownerName,
  isOwner,
  initialPeople,
}: DocumentEditorProps) {
  const [seed] = useState(() => {
    const content = toEditorContent(document.content);
    return {
      content,
      json: JSON.stringify(content),
      title: document.title,
      savedTitle: normalizeDocumentTitle(document.title),
    };
  });

  const lastSavedRef = useRef({
    title: seed.savedTitle,
    content: seed.json,
  });
  const saveGenerationRef = useRef(0);
  const persistRef = useRef<() => Promise<void>>(async () => {});

  const [title, setTitle] = useState(seed.title);
  const [contentJson, setContentJson] = useState(seed.json);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [people, setPeople] = useState(initialPeople);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const shareTarget = MOCK_USERS.find((user) => user.id !== document.owner_id) ?? null;
  const alreadyShared = Boolean(
    shareTarget && people.some((person) => person.id === shareTarget.id && person.role === "editor"),
  );

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        underline: false,
        link: false,
      }),
      Underline,
    ],
    content: seed.content,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = JSON.stringify(instance.getJSON());
      setContentJson((current) => (current === next ? current : next));
    },
  });

  const closeShare = useCallback(() => {
    setShareOpen(false);
  }, []);

  const persist = useCallback(async () => {
    const nextTitle = normalizeDocumentTitle(title);
    const snapshot = { title: nextTitle, content: contentJson };

    if (
      snapshot.title === lastSavedRef.current.title &&
      snapshot.content === lastSavedRef.current.content
    ) {
      return;
    }

    const generation = ++saveGenerationRef.current;
    setStatus("saving");

    const result = await updateDocumentAction(currentUserId, document.id, {
      title: nextTitle,
      content: JSON.parse(contentJson) as Json,
    });

    if (generation !== saveGenerationRef.current) {
      return;
    }

    if ("error" in result) {
      setStatus("failed");
      return;
    }

    lastSavedRef.current = snapshot;
    setStatus("saved");
  }, [contentJson, currentUserId, document.id, title]);

  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void persist();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [persist]);

  useEffect(() => {
    const flush = () => {
      void persistRef.current();
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  async function handleShare() {
    if (!shareTarget || sharing || alreadyShared) {
      return;
    }

    setSharing(true);
    setShareMessage(null);
    const result = await shareDocumentAction(currentUserId, document.id, shareTarget.id);
    setSharing(false);

    if ("error" in result) {
      setShareMessage({
        type: result.error === "Already shared with this user" ? "info" : "error",
        text: result.error,
      });
      return;
    }

    setPeople(result.data.people);
    setShareMessage({ type: "success", text: `Shared with ${shareTarget.name}` });
  }

  async function handleRemove(userId: string) {
    setRemovingId(userId);
    setShareMessage(null);
    const result = await unshareDocumentAction(currentUserId, document.id, userId);
    setRemovingId(null);

    if ("error" in result) {
      setShareMessage({ type: "error", text: result.error });
      return;
    }

    setPeople(result.data.people);
    setShareMessage({ type: "success", text: "Access removed" });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-zinc-500">
          {isOwner ? `Owned by ${ownerName}` : `Shared by ${ownerName}`}
        </p>
        <div className="flex items-center gap-3">
          {isOwner ? (
            <button
              type="button"
              onClick={() => {
                setShareMessage(null);
                setShareOpen(true);
              }}
              className="inline-flex h-9 items-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
            >
              Share
            </button>
          ) : null}
          <SaveIndicator status={status} />
        </div>
      </div>
      <div className="px-5 pt-4 sm:px-8">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={FALLBACK_DOCUMENT_TITLE}
          aria-label="Document title"
          className="w-full min-w-0 rounded-sm border-0 bg-transparent text-2xl font-semibold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-300 sm:text-3xl"
        />
      </div>
      <div className="mt-4 min-w-0">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      {isOwner ? (
        <ShareModal
          open={shareOpen}
          title={title || FALLBACK_DOCUMENT_TITLE}
          people={people}
          shareTarget={shareTarget}
          alreadyShared={alreadyShared}
          sharing={sharing}
          removingId={removingId}
          message={shareMessage}
          onClose={closeShare}
          onShare={() => void handleShare()}
          onRemove={(userId) => void handleRemove(userId)}
        />
      ) : null}
    </div>
  );
}
