export type Note = {
  id: string;
  userId: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: number;
  createdAt: number;
};

const KEY = "demo_notes_v1";

/**
 * PUBLIC_INTERFACE
 * Load notes for a user from localStorage.
 */
export function loadNotes(userId: string): Note[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const all: Note[] = JSON.parse(raw);
    return all.filter((n) => n.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

/**
 * Save entire notes set (for all users).
 */
function saveAllNotes(all: Note[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

/**
 * PUBLIC_INTERFACE
 * Persist a note (insert or update).
 */
export function upsertNote(userId: string, note: Omit<Note, "userId">): Note {
  const raw = localStorage.getItem(KEY);
  let all: Note[] = [];
  if (raw) {
    try {
      all = JSON.parse(raw);
    } catch {
      all = [];
    }
  }
  const idx = all.findIndex((n) => n.id === note.id);
  const toSave: Note = { ...note, userId };
  if (idx >= 0) {
    all[idx] = toSave;
  } else {
    all.push(toSave);
  }
  saveAllNotes(all);
  return toSave;
}

/**
 * PUBLIC_INTERFACE
 * Delete note by id for a user.
 */
export function deleteNote(userId: string, id: string) {
  const raw = localStorage.getItem(KEY);
  if (!raw) return;
  let all: Note[] = [];
  try {
    all = JSON.parse(raw);
  } catch {
    all = [];
  }
  const filtered = all.filter((n) => !(n.userId === userId && n.id === id));
  saveAllNotes(filtered);
}

/**
 * PUBLIC_INTERFACE
 * Load all tags for a user.
 */
export function loadTags(userId: string): string[] {
  const notes = loadNotes(userId);
  const set = new Set<string>();
  notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
  return Array.from(set).sort();
}

/**
 * PUBLIC_INTERFACE
 * Generate a new empty note.
 */
export function newNote(userId: string): Note {
  const now = Date.now();
  return {
    id: `n_${now}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    title: "",
    body: "",
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * PUBLIC_INTERFACE
 * Basic search and filter.
 */
export function filterNotes(notes: Note[], q: string, activeTags: string[]): Note[] {
  let out = notes;
  if (q && q.trim()) {
    const s = q.toLowerCase();
    out = out.filter((n) => n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s));
  }
  if (activeTags.length > 0) {
    out = out.filter((n) => activeTags.every((t) => n.tags.includes(t)));
  }
  return out;
}
