import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Play, Plus, Trash2 } from "lucide-react";
import {
  CodeBlock,
  ConfirmDialog,
  Field,
  Notice,
  QuietButton,
  SelectMenu,
  SignalButton,
  TextInput,
  textareaClass,
} from "@/components";
import { canRunSql, canWriteCode, useCurrentUser } from "@/features/auth";
import { OpenJupyterButton } from "@/features/integrations";
import { ApiError, errorMessage } from "@/lib/api";
import { notifyError } from "@/lib/notify";
import { cn } from "@/lib/utils";
import {
  addCell,
  createNotebook,
  deleteCell,
  deleteNotebook,
  notebooksQuery,
  runCell,
  saveCell,
} from "../api/workbench";
import type { Notebook, NotebookCell } from "../types";
import { QueryResultView } from "./QueryResultView";

const smallButton = "px-3 py-1.5 text-xs";

/**
 * Notebooks kept in DataForge: notes and SQL cells that run in the sandbox under the reader's own
 * permissions. Roles that write code can edit them and take any of them into Jupyter.
 */
export function NotebookPanel({ initialId }: { initialId?: string | undefined }) {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const notebooks = useQuery(notebooksQuery());
  const [selectedId, setSelectedId] = useState(initialId ?? "");
  const [name, setName] = useState("");
  const [removing, setRemoving] = useState(false);
  const mayWrite = canWriteCode(user);

  const list = notebooks.data ?? [];
  const notebook = list.find((item) => item.id === selectedId) ?? list[0];
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notebooks"] });

  const create = useMutation({
    mutationFn: () =>
      createNotebook(name.trim(), [
        { kind: "markdown", source: "What this notebook is for." },
        { kind: "sql", source: "" },
      ]),
    onSuccess: async (created) => {
      await refresh();
      setSelectedId(created.id);
      setName("");
      toast.success(`${created.name} created`);
    },
    onError: notifyError("The notebook could not be created."),
  });

  const remove = useMutation({
    mutationFn: (target: Notebook) => deleteNotebook(target.id),
    onSuccess: async (_result, target) => {
      await refresh();
      setSelectedId("");
      toast.success(`${target.name} deleted`);
    },
    onError: notifyError("The notebook could not be deleted."),
  });

  if (notebooks.isPending)
    return <p className="text-sm text-muted-foreground">Loading notebooks…</p>;
  if (notebooks.isError) {
    return (
      <Notice tone="signal" title="The notebooks did not load">
        {errorMessage(notebooks.error)}
      </Notice>
    );
  }

  const mayEdit =
    mayWrite && notebook !== undefined && (notebook.ownerId === user.id || user.roleId === "admin");
  const mayDelete =
    notebook !== undefined && (notebook.ownerId === user.id || user.roleId === "admin");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        {list.length > 0 ? (
          <SelectMenu
            size="sm"
            label="Notebook"
            className="min-w-64 flex-1 sm:max-w-sm"
            value={notebook?.id ?? ""}
            onValueChange={setSelectedId}
            options={list.map((item) => ({
              value: item.id,
              label: `${item.name} · ${item.owner}`,
            }))}
          />
        ) : null}
        {notebook ? <OpenJupyterButton notebookId={notebook.id} /> : null}
        {mayDelete ? (
          <QuietButton onClick={() => setRemoving(true)}>
            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
            Delete
          </QuietButton>
        ) : null}
      </div>

      {notebook ? (
        <>
          <p className="text-sm text-muted-foreground">
            {notebook.name} · {notebook.owner} · updated {notebook.updated.toLowerCase()} ·{" "}
            {notebook.visibility === "organisation"
              ? "visible to everyone"
              : notebook.visibility === "team"
                ? "visible to the owner's team"
                : "private"}
          </p>
          <div className="space-y-4">
            {notebook.cells.map((cell) => (
              <CellView
                // A cell is remounted when someone else's edit arrives, so the editor never shows stale text.
                key={`${cell.id}-${cell.revision}`}
                notebook={notebook}
                cell={cell}
                mayEdit={mayEdit}
                mayRun={canRunSql(user)}
              />
            ))}
            {notebook.cells.length === 0 ? (
              <p className="text-sm text-muted-foreground">This notebook has no cells yet.</p>
            ) : null}
          </div>
          {mayEdit ? <AddCell notebook={notebook} /> : null}
        </>
      ) : (
        <p className="border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          No notebooks yet.{" "}
          {mayWrite
            ? "Create one below to keep notes and queries together."
            : "Practitioners, stewards and model curators can create them."}
        </p>
      )}

      {mayWrite ? (
        <form
          className="flex flex-wrap items-end gap-3 border-t border-border pt-5"
          onSubmit={(event: FormEvent) => {
            event.preventDefault();
            if (name.trim()) create.mutate();
          }}
        >
          <div className="min-w-64 flex-1 sm:max-w-sm">
            <Field label="New notebook">
              <TextInput
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enrolment quality notes"
                maxLength={200}
              />
            </Field>
          </div>
          <QuietButton type="submit" disabled={create.isPending || !name.trim()}>
            <Plus className="size-4" strokeWidth={1.75} aria-hidden />
            {create.isPending ? "Creating…" : "Create"}
          </QuietButton>
        </form>
      ) : null}

      <ConfirmDialog
        open={removing}
        title={`Delete ${notebook?.name ?? "this notebook"}?`}
        confirmLabel="Delete the notebook"
        onConfirm={() => {
          if (notebook) remove.mutate(notebook);
        }}
        onClose={() => setRemoving(false)}
      >
        Its cells and their saved results are removed. A copy opened in Jupyter is not affected.
      </ConfirmDialog>
    </div>
  );
}

function CellView({
  notebook,
  cell,
  mayEdit,
  mayRun,
}: {
  notebook: Notebook;
  cell: NotebookCell;
  mayEdit: boolean;
  mayRun: boolean;
}) {
  const queryClient = useQueryClient();
  const [source, setSource] = useState(cell.source);
  const [editing, setEditing] = useState(false);
  const dirty = source !== cell.source;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["notebooks"] });

  const save = useMutation({
    mutationFn: () => saveCell(notebook.id, cell, source),
    onSuccess: async () => {
      await refresh();
      setEditing(false);
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.status === 409) {
        // Someone else saved this cell first. Their version replaces the editor, so nothing is overwritten.
        await refresh();
        toast.error("Someone else changed this cell", {
          description: "Their version is shown now. Make your change again if it is still needed.",
        });
        return;
      }
      notifyError("The cell could not be saved.")(error);
    },
  });

  const run = useMutation({
    mutationFn: async () => {
      // Run what is on screen: an unsaved edit is saved first.
      if (dirty && mayEdit) await saveCell(notebook.id, cell, source);
      return runCell(notebook.id, cell.id);
    },
    onSuccess: refresh,
    onError: notifyError("The cell could not be run."),
  });

  const remove = useMutation({
    mutationFn: () => deleteCell(notebook.id, cell.id),
    onSuccess: refresh,
    onError: notifyError("The cell could not be deleted."),
  });

  const output = run.data ?? cell.output;
  const showEditor = mayEdit && (editing || cell.kind === "sql");

  return (
    <div className="panel p-4">
      {showEditor ? (
        <>
          <label className="sr-only" htmlFor={`cell-${cell.id}`}>
            {cell.kind === "sql" ? "SQL" : "Note"}
          </label>
          <textarea
            id={`cell-${cell.id}`}
            className={cn(textareaClass, "resize-y", cell.kind === "markdown" && "font-sans")}
            rows={Math.min(14, Math.max(3, source.split("\n").length + 1))}
            value={source}
            spellCheck={cell.kind === "markdown"}
            onChange={(event) => setSource(event.target.value)}
            onKeyDown={(event) => {
              if (
                cell.kind === "sql" &&
                event.key === "Enter" &&
                (event.metaKey || event.ctrlKey)
              ) {
                event.preventDefault();
                if (mayRun) run.mutate();
              }
            }}
          />
        </>
      ) : cell.kind === "markdown" ? (
        <p className="max-w-[75ch] text-sm whitespace-pre-wrap">
          {cell.source || <span className="text-muted-foreground">An empty note.</span>}
        </p>
      ) : (
        <CodeBlock code={cell.source} label="Notebook SQL" />
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {cell.kind === "sql" && mayRun ? (
          <SignalButton
            className={smallButton}
            disabled={run.isPending || !source.trim()}
            onClick={() => run.mutate()}
          >
            <Play className="size-3.5" strokeWidth={1.75} aria-hidden />
            {run.isPending ? "Running…" : "Run"}
          </SignalButton>
        ) : null}
        {mayEdit && cell.kind === "markdown" && !editing ? (
          <QuietButton className={smallButton} onClick={() => setEditing(true)}>
            Edit
          </QuietButton>
        ) : null}
        {mayEdit && dirty ? (
          <QuietButton
            className={smallButton}
            disabled={save.isPending}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save"}
          </QuietButton>
        ) : null}
        {mayEdit && (dirty || (editing && cell.kind === "markdown")) ? (
          <QuietButton
            className={smallButton}
            onClick={() => {
              setSource(cell.source);
              setEditing(false);
            }}
          >
            Cancel
          </QuietButton>
        ) : null}
        {mayEdit ? (
          <button
            type="button"
            className="ml-auto rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
            disabled={remove.isPending}
            onClick={() => remove.mutate()}
          >
            <Trash2 className="size-4" strokeWidth={1.5} aria-hidden />
            <span className="sr-only">Delete this cell</span>
          </button>
        ) : null}
      </div>

      {cell.kind === "sql" && output ? (
        <div className="mt-4 border-t border-border pt-4" aria-live="polite">
          <QueryResultView result={output} />
        </div>
      ) : null}
    </div>
  );
}

function AddCell({ notebook }: { notebook: Notebook }) {
  const queryClient = useQueryClient();
  const add = useMutation({
    mutationFn: (kind: NotebookCell["kind"]) => addCell(notebook.id, kind),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notebooks"] }),
    onError: notifyError("The cell could not be added."),
  });
  return (
    <div className="flex flex-wrap gap-2">
      <QuietButton
        className={smallButton}
        disabled={add.isPending}
        onClick={() => add.mutate("sql")}
      >
        <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
        SQL cell
      </QuietButton>
      <QuietButton
        className={smallButton}
        disabled={add.isPending}
        onClick={() => add.mutate("markdown")}
      >
        <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
        Note
      </QuietButton>
    </div>
  );
}
