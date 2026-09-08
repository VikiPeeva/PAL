import type { PnmlNet } from "../types/pnml";
import type { PetriNetAnnotations } from "../types/pnmlAnnotations";
import { generateDummyAnnotations } from "../dev/dummyAnnotations";

/**
 * Single point where the app gets annotation data for a parsed net.
 * Currently backed by randomly generated placeholder data — swap this
 * one export for a real data source once one exists; no viewer should
 * need to change.
 */
export const annotationsProvider: (net: PnmlNet) => PetriNetAnnotations | undefined = generateDummyAnnotations;
