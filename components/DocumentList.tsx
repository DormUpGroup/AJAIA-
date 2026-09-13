import { DocumentCard } from "@/components/DocumentCard";
import type { DocumentListItem } from "@/lib/document-types";

type DocumentListProps = {
  title: string;
  emptyMessage: string;
  documents: DocumentListItem[];
  badge: "Owned" | "Shared";
};

export function DocumentList({
  title,
  emptyMessage,
  documents,
  badge,
}: DocumentListProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
      {documents.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm leading-6 text-zinc-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} badge={badge} />
          ))}
        </div>
      )}
    </section>
  );
}
