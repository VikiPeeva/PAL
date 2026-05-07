import { useFiles } from "./hooks/useFiles";
import { useDragDrop } from "./hooks/useDragDrop";
import { useEventLog } from "./hooks/useEventLog";
import { usePetriNet } from "./hooks/usePetriNet";
import { useZipContents } from "./hooks/useZipContents";
import { EventLogViewer } from "./components/EventLogViewer";
import { PetriNetViewer } from "./components/PetriNetViewer";
import { ZipViewer } from "./components/ZipViewer";
import { FileBar } from "./components/FileBar";
import { EmptyState } from "./components/EmptyState";
import "./App.css";

function App() {
  const { uploadedFiles, selectedFile, rawContent, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile, fileName } = useFiles();
  const { isDragging } = useDragDrop(addPaths);
  const { parsedLog, variants } = useEventLog(selectedFile, rawContent);
  const { petriNet } = usePetriNet(selectedFile, rawContent);
  const { pnmlFiles } = useZipContents(selectedFile);

  const zipMode = pnmlFiles !== null && pnmlFiles.length > 0;

  return (
    <main className={`container${isDragging ? " drag-over" : ""}`}>
      <div className={`content-area${zipMode ? " zip-mode" : ""}`}>
        {isDragging && <div className="drop-hint">Drop files here</div>}

        {parsedLog && <EventLogViewer variants={variants} />}

        {petriNet && <PetriNetViewer petriNet={petriNet} />}

        {zipMode && <ZipViewer key={selectedFile} pnmlFiles={pnmlFiles} />}

        {!parsedLog && !petriNet && !zipMode && rawContent !== null && (
          <pre className="file-content">{rawContent}</pre>
        )}

        {!parsedLog && !petriNet && !zipMode && rawContent === null && <EmptyState />}
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