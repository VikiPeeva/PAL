import { useMemo } from "react";
import { buildAnnotatedNet } from "../utils/buildAnnotatedNet";
import type { PnmlNet } from "../types/pnml";
import type { AnnotatedPetriNet, PetriNetAnnotations } from "../types/pnmlAnnotations";

export function usePetriNet(
  selectedFile: string | null,
  rawContent: string | null,
  getAnnotations?: (net: PnmlNet) => PetriNetAnnotations | undefined,
) {
  const { annotatedNet, error } = useMemo<{ annotatedNet: AnnotatedPetriNet | null; error: string | null }>(() => {
    if (!selectedFile || !rawContent) return { annotatedNet: null, error: null };
    const lower = selectedFile.toLowerCase();
    if (!lower.endsWith(".pnml") && !lower.endsWith(".apnml")) return { annotatedNet: null, error: null };
    try {
      return { annotatedNet: buildAnnotatedNet(rawContent, getAnnotations), error: null };
    } catch (e) {
      return { annotatedNet: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [selectedFile, rawContent, getAnnotations]);

  return { annotatedNet, error };
}