import { parsePnml } from "./parsePnml";
import type { PnmlNet } from "../types/pnml";
import type { AnnotatedPetriNet, PetriNetAnnotations } from "../types/pnmlAnnotations";

export function buildAnnotatedNet(
  pnmlContent: string,
  getAnnotations?: (net: PnmlNet) => PetriNetAnnotations | undefined,
): AnnotatedPetriNet | null {
  try {
    const net = parsePnml(pnmlContent);
    return { net, annotations: getAnnotations?.(net) };
  } catch {
    return null;
  }
}
