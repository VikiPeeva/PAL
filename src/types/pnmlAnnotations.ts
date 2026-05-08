import type { PnmlNet } from "./pnml";

export interface AnnotatedPetriNet {
  net:          PnmlNet;
  annotations?: PetriNetAnnotations;
}

export interface PlaceAnnotation {
  /** Number of process instances that visited this place */
  caseFrequency?: number;
  /** Sojourn-time histogram (bucket counts, left-to-right = short-to-long) */
  distribution?: number[];
}

export interface TransitionAnnotation {
  /** Number of times this transition fired */
  firingCount?: number;
  /** Mean firing duration in seconds */
  avgDuration?: number;
  /** Duration histogram (bucket counts, left-to-right = short-to-long) */
  distribution?: number[];
}

export interface ArcAnnotation {
  /** Number of times tokens crossed this arc */
  flowCount?: number;
}

export interface PetriNetAnnotations {
  places:      Record<string, PlaceAnnotation>;
  transitions: Record<string, TransitionAnnotation>;
  arcs:        Record<string, ArcAnnotation>;
}

export type AnnotationKey =
  | "place.caseFrequency"
  | "place.distribution"
  | "transition.firingCount"
  | "transition.avgDuration"
  | "transition.distribution"
  | "arc.flowCount";

export const SLOT_COLORS: [string, string] = ["#4263eb", "#0ca678"];

export interface AnnotationGroup {
  label: string;
  items: { key: AnnotationKey; label: string }[];
}

export const ANNOTATION_GROUPS: AnnotationGroup[] = [
  { label: "Places", items: [
    { key: "place.caseFrequency", label: "Frequency" },
    { key: "place.distribution",  label: "Distribution" },
  ]},
  { label: "Transitions", items: [
    { key: "transition.firingCount",  label: "Count" },
    { key: "transition.avgDuration",  label: "Avg duration" },
    { key: "transition.distribution", label: "Distribution" },
  ]},
  { label: "Arcs", items: [
    { key: "arc.flowCount", label: "Flow count" },
  ]},
];

const DEFAULT_ANNOTATION_KEYS: AnnotationKey[] = [
  "place.caseFrequency",
  "transition.firingCount",
  "transition.distribution",
  "arc.flowCount",
];

export function buildDefaultEnabledColors(): Map<AnnotationKey, string> {
  const map = new Map<AnnotationKey, string>();
  for (const group of ANNOTATION_GROUPS) {
    let slot = 0;
    for (const { key } of group.items) {
      if (DEFAULT_ANNOTATION_KEYS.includes(key)) {
        map.set(key, SLOT_COLORS[slot++]);
      }
    }
  }
  return map;
}
