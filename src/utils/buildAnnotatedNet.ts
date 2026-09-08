import { parsePnml } from "./parsePnml";
import type { PnmlNet } from "../types/pnml";
import type { AnnotatedPetriNet, PetriNetAnnotations } from "../types/pnmlAnnotations";

/** Throws if `pnmlContent` isn't valid PNML — callers decide how to handle that. */
export function buildAnnotatedNet(
  pnmlContent: string,
  getAnnotations?: (net: PnmlNet) => PetriNetAnnotations | undefined,
): AnnotatedPetriNet {
  const net = parsePnml(pnmlContent);
  return { net, annotations: getAnnotations?.(net) };
}
