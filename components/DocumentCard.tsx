import Link from "next/link";

import { FALLBACK_DOCUMENT_TITLE } from "@/lib/document-title";
import type { DocumentListItem } from "@/lib/document-types";
import { formatUpdatedAt } from "@/lib/format";

type DocumentCardProps = {
  document: DocumentListItem;
  badge: "Owned" | "Shared";
};

export function DocumentCard({ document, badge }: DocumentCardProps) {
  return (
    <Link
      href={`/documents/${document.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-base font-semibold text-zinc-900">
          {document.title || FALLBACK_DOCUMENT_TITLE}
        </h3>
        <span
          className={
            badge === "Owned"
              ? "shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700"
              : "shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800"
          }
        >
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm text-zinc-600">Owner: {document.owner_name}</p>
      <p className="mt-1 text-xs text-zinc-500">Updated {formatUpdatedAt(document.updated_at)}</p>
    </Link>
  );
}
