"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { importTxtDocumentAction } from "@/app/actions/documents";
import { TXT_ACCEPT, validateTxtFile } from "@/lib/upload";

type UploadTxtButtonProps = {
  userId: string;
  disabled?: boolean;
  onError: (message: string | null) => void;
};

export function UploadTxtButton({ userId, disabled, onError }: UploadTxtButtonProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const validationError = validateTxtFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    setUploading(true);
    onError(null);

    const formData = new FormData();
    formData.append("file", file);
    const result = await importTxtDocumentAction(userId, formData);

    if ("error" in result) {
      onError(result.error);
      setUploading(false);
      return;
    }

    router.push(`/documents/${result.data.id}`);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={TXT_ACCEPT}
        className="sr-only"
        aria-label="Upload a .txt file"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void handleFile(file);
          }
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "Importing…" : "Upload .txt"}
      </button>
    </>
  );
}
