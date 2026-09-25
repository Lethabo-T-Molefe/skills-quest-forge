import { useSuspenseQuery } from "@tanstack/react-query";
import { notebooksQuery } from "../api/workbench";

export function useNotebooks() {
  return useSuspenseQuery(notebooksQuery()).data;
}
