import { json, type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { requireUser } from "~/utils/auth.server";
import { Spiral } from "~/components/Spiral";
import { Toolbar } from "~/components/Toolbar";
import { filterNotes, loadNotes, loadTags, newNote, type Note, upsertNote, deleteNote } from "~/utils/notes.client";
import { TagIcon } from "~/components/icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Notepad — Notes" },
    { name: "description", content: "Create, edit, search, and organize your notes." },
  ];
};

// PUBLIC_INTERFACE
/** Loader: Return user and initial data (client will pull notes/tags). */
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const tagFilters = url.searchParams.getAll("tag");
  return json({ user, q, tagFilters });
}

// PUBLIC_INTERFACE
/** Action: Support delete via intent; save is handled client-side localStorage */
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const form = await request.formData();
  const intent = String(form.get("_intent") || "");
  if (intent === "delete") {
    const id = String(form.get("id") || "");
    return json({ deleted: id });
  }
  return json({ ok: true });
}

type ActionData = { deleted?: string; ok?: boolean };

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const q = loaderData.q;
  const userEmail = loaderData.user.email;
  const actionData = useActionData<ActionData>();
  const nav = useNavigation();

  // Client state
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const n = loadNotes(user.id);
    setNotes(n);
    setAllTags(loadTags(user.id));
    if (n.length > 0) {
      const first = n[0];
      setActiveId(first.id);
      setTitle(first.title);
      setBody(first.body);
      setTags(first.tags);
    } else {
      setActiveId(null);
      setTitle("");
      setBody("");
      setTags([]);
    }
  }, [user.id]);

  // Handle delete outcome
  useEffect(() => {
    if (actionData?.deleted) {
      if (activeId === actionData.deleted) {
        const remaining = loadNotes(user.id);
        setNotes(remaining);
        setAllTags(loadTags(user.id));
        const first = remaining[0];
        setActiveId(first?.id ?? null);
        setTitle(first?.title ?? "");
        setBody(first?.body ?? "");
        setTags(first?.tags ?? []);
      }
      setToast("Note deleted");
      const t = setTimeout(() => setToast(null), 1800);
      return () => clearTimeout(t);
    }
  }, [actionData?.deleted, activeId, user.id]);

  // Filters
  const query = searchParams.get("q") ?? q ?? "";
  const filterTags = searchParams.getAll("tag");
  const filtered = useMemo(() => filterNotes(notes, query, filterTags), [notes, query, filterTags]);

  // Pick active note
  const activeNote = useMemo(() => filtered.find((n) => n.id === activeId) ?? filtered[0], [filtered, activeId]);
  useEffect(() => {
    if (activeNote) {
      setActiveId(activeNote.id);
      setTitle(activeNote.title);
      setBody(activeNote.body);
      setTags(activeNote.tags);
    } else {
      setActiveId(null);
      setTitle("");
      setBody("");
      setTags([]);
    }
  }, [activeNote?.id, activeNote]);

  // Create new note
  function handleNew() {
    const n = newNote(user.id);
    setNotes((prev) => [n, ...prev]);
    setActiveId(n.id);
    setTitle("");
    setBody("");
    setTags([]);
  }

  // Save note
  function handleSave() {
    if (!activeId) {
      // new note not yet persisted
      const n = newNote(user.id);
      const saved = upsertNote(user.id, { ...n, id: n.id, title, body, tags, createdAt: n.createdAt, updatedAt: Date.now() });
      setNotes((prev) => {
        const next = [saved, ...prev.filter((p) => p.id !== saved.id)];
        return next;
      });
      setActiveId(saved.id);
    } else {
      const existing = notes.find((n) => n.id === activeId);
      const base = existing ?? newNote(user.id);
      const saved = upsertNote(user.id, { ...base, id: activeId, title, body, tags, updatedAt: Date.now() });
      setNotes((prev) => {
        const next = [saved, ...prev.filter((p) => p.id !== saved.id)];
        return next;
      });
    }
    setAllTags(loadTags(user.id));
    setToast("Saved");
    const t = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(t);
  }

  // Export note as .txt
  function handleExport() {
    const content = `# ${title}\n\n${body}\n\nTags: ${tags.join(", ")}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Delete submit ref
  const formRef = useRef<HTMLFormElement>(null);

  // Tag handling
  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }
  function addTag(tag: string) {
    if (!tag) return;
    setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    if (!allTags.includes(tag)) setAllTags((prev) => [...prev, tag].sort());
  }

  const [newTag, setNewTag] = useState("");

  return (
    <main role="main" aria-label={`Notepad page for ${userEmail}`} className="paper-wrap">
      <span className="label-sr" aria-live="polite">Signed in as {userEmail}</span>
      <div className="notepad" role="region" aria-label="Notepad page">
        <Spiral count={12} />
        <Toolbar
          onNew={handleNew}
          onExport={handleExport}
          disableSave={nav.state !== "idle"}
          disableDelete={!activeId}
          formId="note-form"
        />
        <div className="sheet">
          <aside className="sidebar" aria-label="Notes sidebar">
            <div className="section">
              <strong>Tags</strong>
              <div className="tags" role="group" aria-label="Available tags">
                {allTags.length === 0 && <span className="text-sm" style={{ color: "var(--ink-muted)" }}>No tags yet</span>}
                {allTags.map((t) => (
                  <button
                    key={t}
                    className="tag-pill"
                    type="button"
                    aria-pressed={tags.includes(t)}
                    onClick={() => toggleTag(t)}
                    aria-label={`Toggle tag ${t}`}
                  >
                    <TagIcon /> {t}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  className="input"
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  aria-label="New tag"
                />
                <button className="btn" type="button" onClick={() => { addTag(newTag.trim()); setNewTag(""); }}>
                  Add
                </button>
              </div>
            </div>

            <div className="section">
              <strong>Notes</strong>
              <div className="list" role="list">
                {filtered.map((n) => (
                  <button
                    key={n.id}
                    className="note-item"
                    aria-current={activeId === n.id}
                    onClick={() => {
                      setActiveId(n.id);
                      setTitle(n.title);
                      setBody(n.body);
                      setTags(n.tags);
                    }}
                  >
                    <span className="title">{n.title || "Untitled"}</span>
                    <span className="meta">
                      {new Date(n.updatedAt).toLocaleString()} • {n.tags.join(", ")}
                    </span>
                  </button>
                ))}
                {filtered.length === 0 && <span className="text-sm" style={{ color: "var(--ink-muted)" }}>No notes match.</span>}
              </div>
            </div>
          </aside>

          <section className="editor">
            <Form id="note-form" method="post" ref={formRef} replace onSubmit={(e) => {
              const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
              if (submitter?.value === "delete") {
                // allow server action to mark deletion for toast/state refresh
                if (activeId) {
                  // also update localStorage
                  deleteNote(user.id, activeId);
                }
                return;
              }
              e.preventDefault();
              handleSave();
            }}>
              <input type="hidden" name="id" value={activeId ?? ""} />
              <label htmlFor="title" className="label-sr">Title</label>
              <input
                id="title"
                className="note-title"
                name="title"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label htmlFor="body" className="label-sr">Body</label>
              <textarea
                id="body"
                className="note-body"
                name="body"
                placeholder="Start typing..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              <input type="hidden" name="tags" value={JSON.stringify(tags)} />
            </Form>

            <footer className="statusbar" aria-live="polite">
              <span>{activeId ? "Editing note" : "New note (unsaved)"}</span>
              <span>{tags.length} tag(s)</span>
            </footer>
          </section>
        </div>
      </div>

      {toast && <div className="toast" role="status" aria-live="polite">{toast}</div>}
    </main>
  );
}
