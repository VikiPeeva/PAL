import { FileTypeIcon } from "../shared/FileTypeIcon";
import { fileName, fileExtension } from "../../utils/fileTypes";
import "./FileBar.css";

interface Props {
  files: string[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  onRemoveFile: (path: string) => void;
  onAddFiles: () => void;
}

export function FileBar({ files, selectedFile, onSelectFile, onRemoveFile, onAddFiles }: Props) {
  return (
    <div className="file-bar">
      <button className="file-bar-add" onClick={onAddFiles}>+ Add</button>

      {files.map((path) => (
        // The chip and its remove control are siblings: a button cannot be
        // nested inside another button, so the wrapper does the positioning.
        <div key={path} className="file-chip-wrap">
          <button
            type="button"
            title={path}
            className={`file-chip${selectedFile === path ? " selected" : ""}`}
            aria-current={selectedFile === path}
            onClick={() => onSelectFile(path)}
          >
            <FileTypeIcon extension={fileExtension(path)} />
            <span className="file-chip-name">{fileName(path)}</span>
          </button>
          <button
            type="button"
            className="file-chip-remove"
            onClick={() => onRemoveFile(path)}
            aria-label={`Remove ${fileName(path)}`}
            title="Remove"
          >×</button>
        </div>
      ))}
    </div>
  );
}
