import { useFiles } from "./hooks/useFiles";
import { useDragDrop } from "./hooks/useDragDrop";
import { useFileContent, type FileContent } from "./hooks/useFileContent";
import { EventLogViewer } from "./components/viewers/EventLogViewer";
import { PetriNetViewer } from "./components/viewers/processModels/PetriNetViewer.tsx";
import { ZipViewer } from "./components/viewers/ZipViewer";
import { FileBar } from "./components/core/FileBar";
import { EmptyState } from "./components/core/EmptyState";
import { LoadingState } from "./components/core/LoadingState";
import { annotationsProvider } from "./services/annotationsProvider";
import "./App.css";

function ContentView({ content, selectedFile }: { content: FileContent; selectedFile: string | null }) {
  switch (content.status) {
    case "empty":
      return <EmptyState />;
    case "loading":
      return <LoadingState fileName={content.fileName} />;
    case "readError":
      return <p className="parse-error">Couldn't read this file: {content.message}</p>;
    case "eventLog":
      return <EventLogViewer variants={content.variants} />;
    case "petriNet":
      return <PetriNetViewer annotatedNet={content.net} />;
    case "archive":
      return <ZipViewer key={selectedFile} pnmlFiles={content.pnmlFiles} getAnnotations={annotationsProvider} />;
    case "emptyArchive":
      return <p className="parse-error">This archive contains no PNML files.</p>;
    case "raw":
      return (
        <>
          {content.parseError && (
            <p className="parse-error">Couldn't parse this file: {content.parseError}</p>
          )}
          <pre className="file-content">{content.content}</pre>
        </>
      );
  }
  // Adding a FileContent case without handling it above fails to compile here.
  const unhandled: never = content;
  return unhandled;
}

function App() {
  const { uploadedFiles, selectedFile, loaded, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile } = useFiles();
  const { isDragging } = useDragDrop(addPaths);
  const content = useFileContent(selectedFile, loaded);

  return (
    <main className={`container${isDragging ? " drag-over" : ""}`}>
      <div className={`content-area${content.status === "archive" ? " zip-mode" : ""}`}>
        {isDragging && <div className="drop-hint">Drop files here</div>}

        <ContentView content={content} selectedFile={selectedFile} />
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
