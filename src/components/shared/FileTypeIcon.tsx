import { FILE_TYPES, type FileExtension } from "../../utils/fileTypes";

const FALLBACK_COLOR = "#868e96";

interface Props {
  extension: string;
}

export function FileTypeIcon({ extension }: Props) {
  const ext  = extension.toLowerCase();
  const spec = FILE_TYPES[ext as FileExtension] as { label: string; color: string } | undefined;

  return (
    <span className="file-type-icon" style={{ backgroundColor: spec?.color ?? FALLBACK_COLOR }}>
      {spec?.label ?? ext.slice(0, 3).toUpperCase()}
    </span>
  );
}
