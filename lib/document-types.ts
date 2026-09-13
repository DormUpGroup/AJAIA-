import type { Document } from "@/lib/supabase/types";

export type DocumentListItem = {
  id: string;
  title: string;
  owner_id: string;
  owner_name: string;
  created_at: string;
  updated_at: string;
};

export type DocumentPerson = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "editor";
};

export type DocumentEditorData = {
  document: Document;
  owner_name: string;
  is_owner: boolean;
  people: DocumentPerson[];
};

export type ActionError = { error: string };
export type ActionOk<T> = { data: T };
export type ActionResult<T> = ActionOk<T> | ActionError;
