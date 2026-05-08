import { useState, useMemo } from "react";
import { parsePnml } from "../../utils/parsePnml";
import { PetriNetViewer } from "./PetriNetViewer";
import { FileTypeIcon } from "../shared/FileTypeIcon";
import type { ZipPnmlFile, PnmlNet } from "../../types/pnml";
import type { PetriNetAnnotations } from "../../types/pnmlAnnotations.ts";
import "./ZipViewer.css";

interface Props {
  pnmlFiles:      ZipPnmlFile[];
  getAnnotations?: (net: PnmlNet) => PetriNetAnnotations | undefined;
}

export function ZipViewer({ pnmlFiles, getAnnotations }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const petriNet = useMemo(() => {
    const file = pnmlFiles[selectedIndex];
    if (!file) return null;
    try { return parsePnml(file.content); }
    catch { return null; }
  }, [pnmlFiles, selectedIndex]);

  const annotations = useMemo(
    () => (petriNet && getAnnotations ? getAnnotations(petriNet) : undefined),
    [petriNet, getAnnotations],
  );

  return (
    <div className="zip-viewer">
      <div className="zip-file-list">
        {pnmlFiles.map((file, i) => (
          <div
            key={file.name}
            className={`zip-file-item${i === selectedIndex ? " selected" : ""}`}
            onClick={() => setSelectedIndex(i)}
          >
            <FileTypeIcon extension="pnml" />
            <span className="zip-file-item-name">{file.name}</span>
          </div>
        ))}
      </div>
      <div className="zip-viewer-panel">
        {petriNet && <PetriNetViewer petriNet={petriNet} annotations={annotations} />}
      </div>
    </div>
  );
}
