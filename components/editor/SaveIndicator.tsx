export type SaveStatus = "saved" | "saving" | "failed";

export function SaveIndicator({ status }: { status: SaveStatus }) {
  const label =
    status === "saving" ? "Saving…" : status === "failed" ? "Save failed" : "Saved";

  return (
    <p
      role="status"
      aria-live="polite"
      className={
        status === "failed"
          ? "shrink-0 text-sm font-medium text-red-700"
          : status === "saving"
            ? "shrink-0 text-sm text-zinc-600"
            : "shrink-0 text-sm text-zinc-500"
      }
    >
      {label}
    </p>
  );
}
