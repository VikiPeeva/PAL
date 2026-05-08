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
