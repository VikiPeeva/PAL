import { useMemo } from "react";
import { buildAnnotatedNet } from "../utils/buildAnnotatedNet";
import type { PnmlNet } from "../types/pnml";
import type { AnnotatedPetriNet, PetriNetAnnotations } from "../types/pnmlAnnotations";

export function usePetriNet(
  selectedFile: string | null,
  rawContent: string | null,
  getAnnotations?: (net: PnmlNet) => PetriNetAnnotations | undefined,
) {
  const annotatedNet = useMemo<AnnotatedPetriNet | null>(() => {
    if (!selectedFile || !rawContent) return null;
    const lower = selectedFile.toLowerCase();
    if (!lower.endsWith(".pnml") && !lower.endsWith(".apnml")) return null;
    return buildAnnotatedNet(rawContent, getAnnotations);
  }, [selectedFile, rawContent, getAnnotations]);

  return { annotatedNet };
}