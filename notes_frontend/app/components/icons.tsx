/**
 * PUBLIC_INTERFACE
 * Simple outline icons matching the style guide (1.5-1.75 stroke).
 */
export function NewIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="var(--ink-secondary)" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 7h14v12H5z" stroke="var(--ink-secondary)" strokeWidth="1.75" fill="none" />
      <path d="M9 7v4h6V7" stroke="var(--ink-secondary)" strokeWidth="1.75" />
    </svg>
  );
}

export function DeleteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h12M9 7V5h6v2M8 7l1 12m6-12-1 12" stroke="var(--ink-secondary)" strokeWidth="1.75" fill="none" />
    </svg>
  );
}

export function ExportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V6m0 0l-4 4m4-4 4 4" stroke="var(--ink-secondary)" strokeWidth="1.75" fill="none" strokeLinecap="round" />
      <path d="M4 18h16" stroke="var(--ink-secondary)" strokeWidth="1.75" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="var(--ink-secondary)" strokeWidth="1.75" fill="none" />
      <path d="M21 21l-4.3-4.3" stroke="var(--ink-secondary)" strokeWidth="1.75" />
    </svg>
  );
}

export function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 13l-7 7-9-9V4h7l9 9z" stroke="var(--ink-secondary)" strokeWidth="1.75" fill="none" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="var(--ink-secondary)" />
    </svg>
  );
}
