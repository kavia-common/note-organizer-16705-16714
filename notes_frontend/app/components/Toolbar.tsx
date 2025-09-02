import { NewIcon, SaveIcon, DeleteIcon, ExportIcon } from "./icons";

/**
 * PUBLIC_INTERFACE
 * Toolbar with New, Save, Delete, Export actions.
 */
export function Toolbar(props: {
  onNew?: () => void;
  onExport?: () => void;
  disableSave?: boolean;
  disableDelete?: boolean;
  formId?: string; // when provided, Save/Delete buttons will submit that form
}) {
  const { onNew, onExport, disableSave, disableDelete, formId } = props;
  return (
    <nav className="toolbar" aria-label="Note actions">
      <button className="btn" type="button" aria-label="New note" onClick={onNew}>
        <NewIcon />
        New
      </button>
      <button className="btn" type="submit" form={formId} aria-label="Save note" disabled={disableSave}>
        <SaveIcon />
        Save
      </button>
      <button
        className="btn btn-danger"
        type="submit"
        form={formId}
        name="_intent"
        value="delete"
        aria-label="Delete note"
        disabled={disableDelete}
      >
        <DeleteIcon />
        Delete
      </button>
      <button className="btn" type="button" aria-label="Export note" onClick={onExport}>
        <ExportIcon />
        Export
      </button>
    </nav>
  );
}
