import { useState, useMemo } from "react";
import { parsePnml } from "../../utils/parsePnml";
import { PetriNetViewer } from "./PetriNetViewer";
import { FileTypeIcon } from "../shared/FileTypeIcon";
import type { ZipPnmlFile, PnmlNet } from "../../types/pnml";
import type { AnnotatedPetriNet, PetriNetAnnotations } from "../../types/pnmlAnnotations.ts";
import "./ZipViewer.css";

interface Props {
  pnmlFiles:       ZipPnmlFile[];
  getAnnotations?: (net: PnmlNet) => PetriNetAnnotations | undefined;
}

export function ZipViewer({ pnmlFiles, getAnnotations }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const annotatedNet = useMemo<AnnotatedPetriNet | null>(() => {
    const file = pnmlFiles[selectedIndex];
    if (!file) return null;
    try {
      const net = parsePnml(file.content);
      return { net, annotations: getAnnotations?.(net) };
    } catch { return null; }
  }, [pnmlFiles, selectedIndex, getAnnotations]);

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
        {annotatedNet && <PetriNetViewer annotatedNet={annotatedNet} />}
      </div>
    </div>
  );
}
