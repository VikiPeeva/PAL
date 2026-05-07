import { useMemo } from "react";
import { parsePnml } from "../utils/parsePnml";
import type { PnmlNet } from "../types/pnml";

export function usePetriNet(selectedFile: string | null, rawContent: string | null) {
  const petriNet = useMemo<PnmlNet | null>(() => {
    if (!selectedFile || !rawContent) return null;
    const lower = selectedFile.toLowerCase();
    if (!lower.endsWith(".pnml") && !lower.endsWith(".apnml")) return null;
    try {
      return parsePnml(rawContent);
    } catch {
      return null;
    }
  }, [selectedFile, rawContent]);

  return { petriNet };
}