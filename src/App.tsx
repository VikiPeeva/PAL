import { useFiles } from "./hooks/useFiles";
import { useDragDrop } from "./hooks/useDragDrop";
import { useEventLog } from "./hooks/useEventLog";
import { EventLogViewer } from "./components/EventLogViewer";
import { FileBar } from "./components/FileBar";
import { EmptyState } from "./components/EmptyState";
import "./App.css";

function App() {
  const { uploadedFiles, selectedFile, rawContent, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile, fileName } = useFiles();
  const { isDragging } = useDragDrop(addPaths);
  const { parsedLog, variants } = useEventLog(selectedFile, rawContent);

  return (
    <main className={`container${isDragging ? " drag-over" : ""}`}>
      <div className="content-area">
        {isDragging && <div className="drop-hint">Drop files here</div>}

        {parsedLog && <EventLogViewer variants={variants} />}

        {!parsedLog && rawContent !== null && (
          <pre className="file-content">{rawContent}</pre>
        )}

        {!parsedLog && rawContent === null && <EmptyState />}
      </div>

      <FileBar
        files={uploadedFiles}
        selectedFile={selectedFile}
        onSelectFile={handleSelectFile}
        onRemoveFile={handleRemoveFile}
        onAddFiles={handleAddFiles}
        fileName={fileName}
      />
    </main>
  );
}

export default App;