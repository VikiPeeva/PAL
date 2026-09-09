import { FILE_TYPES, type FileExtension } from "../../utils/fileTypes";
import "./FileTypeIcon.css";

interface Props {
  extension: string;
}

export function FileTypeIcon({ extension }: Props) {
  const ext  = extension.toLowerCase();
  const spec = FILE_TYPES[ext as FileExtension] as { label: string; color: string } | undefined;

  return (
    <span className="file-type-icon" style={{ backgroundColor: spec?.color ?? "var(--color-unassigned)" }}>
      {spec?.label ?? ext.slice(0, 3).toUpperCase()}
    </span>
  );
}
