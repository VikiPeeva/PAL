import { useMemo } from "react";
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
// DEV-ONLY: replace with real annotation data when available
import { generateDummyAnnotations } from "./dev/dummyAnnotations";
import "./App.css";

function App() {
  const { uploadedFiles, selectedFile, rawContent, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile, fileName } = useFiles();
  const { isDragging } = useDragDrop(addPaths);
  const { parsedLog, variants } = useEventLog(selectedFile, rawContent);
  const { petriNet } = usePetriNet(selectedFile, rawContent);
  const { pnmlFiles } = useZipContents(selectedFile);
  // DEV-ONLY: bundle net + dummy annotations; replace generateDummyAnnotations when real data arrives
  const annotatedNet = useMemo(
    () => (petriNet ? { net: petriNet, annotations: generateDummyAnnotations(petriNet) } : undefined),
    [petriNet],
  );

  const zipMode = pnmlFiles !== null && pnmlFiles.length > 0;

  return (
    <main className={`container${isDragging ? " drag-over" : ""}`}>
      <div className={`content-area${zipMode ? " zip-mode" : ""}`}>
        {isDragging && <div className="drop-hint">Drop files here</div>}

        {parsedLog && <EventLogViewer variants={variants} />}

        {annotatedNet && <PetriNetViewer annotatedNet={annotatedNet} />}

        {zipMode && <ZipViewer key={selectedFile} pnmlFiles={pnmlFiles} getAnnotations={generateDummyAnnotations} />}

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