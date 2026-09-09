import { useFiles } from "./hooks/useFiles";
import { useDragDrop } from "./hooks/useDragDrop";
import { useEventLog } from "./hooks/useEventLog";
import { usePetriNet } from "./hooks/usePetriNet";
import { useZipContents } from "./hooks/useZipContents";
import { EventLogViewer } from "./components/viewers/EventLogViewer";
import { PetriNetViewer } from "./components/viewers/processModels/PetriNetViewer.tsx";
import { ZipViewer } from "./components/viewers/ZipViewer";
import { FileBar } from "./components/core/FileBar";
import { EmptyState } from "./components/core/EmptyState";
import { annotationsProvider } from "./services/annotationsProvider";
import "./App.css";

function App() {
  const { uploadedFiles, selectedFile, rawContent, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile } = useFiles();
  const { isDragging } = useDragDrop(addPaths);
  const { parsedLog, variants, error: xesError } = useEventLog(selectedFile, rawContent);
  const { annotatedNet, error: pnmlError } = usePetriNet(selectedFile, rawContent, annotationsProvider);
  const { pnmlFiles } = useZipContents(selectedFile);

  const zipMode = pnmlFiles !== null && pnmlFiles.length > 0;
  // Only one of these can be set for a given selectedFile — its extension picks the parser.
  const parseError = xesError ?? pnmlError;

  return (
    <main className={`container${isDragging ? " drag-over" : ""}`}>
      <div className={`content-area${zipMode ? " zip-mode" : ""}`}>
        {isDragging && <div className="drop-hint">Drop files here</div>}

        {parsedLog && <EventLogViewer variants={variants} />}

        {annotatedNet && <PetriNetViewer annotatedNet={annotatedNet} />}

        {zipMode && <ZipViewer key={selectedFile} pnmlFiles={pnmlFiles} getAnnotations={annotationsProvider} />}

        {!parsedLog && !annotatedNet && !zipMode && rawContent !== null && (
          <>
            {parseError && (
              <p className="parse-error">Couldn't parse this file: {parseError}</p>
            )}
            <pre className="file-content">{rawContent}</pre>
          </>
        )}

        {!parsedLog && !annotatedNet && !zipMode && rawContent === null && <EmptyState />}
      </div>

      <FileBar
        files={uploadedFiles}
        selectedFile={selectedFile}
        onSelectFile={handleSelectFile}
        onRemoveFile={handleRemoveFile}
        onAddFiles={handleAddFiles}
      />
    </main>
  );
}

export default App;