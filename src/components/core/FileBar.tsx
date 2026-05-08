import { FileTypeIcon } from "../shared/FileTypeIcon";
import "./FileBar.css";

interface Props {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  onRemoveFile: (path: string) => void;
  onAddFiles: () => void;
  fileName: (path: string) => string;
}

export function FileBar({ files, selectedFile, onSelectFile, onRemoveFile, onAddFiles, fileName }: Props) {
  const extension = (path: string) => fileName(path).split(".").pop() ?? "";

  return (
    <div className="file-bar">
      <button className="file-bar-add" onClick={onAddFiles}>+ Add</button>

      {files.map((path) => (
        <div
          key={path}
          title={path}
          className={`file-chip${selectedFile === path ? " selected" : ""}`}
          onClick={() => onSelectFile(path)}
        >
          <FileTypeIcon extension={extension(path)} />
          <span className="file-chip-name">{fileName(path)}</span>
          <button
            className="file-chip-remove"
            onClick={(e) => { e.stopPropagation(); onRemoveFile(path); }}
            title="Remove"
          >×</button>
        </div>
      ))}
    </div>
  );
}