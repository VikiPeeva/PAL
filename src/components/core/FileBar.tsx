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
        <div
          key={path}
          title={path}
          className={`file-chip${selectedFile === path ? " selected" : ""}`}
          onClick={() => onSelectFile(path)}
        >
          <FileTypeIcon extension={fileExtension(path)} />
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
