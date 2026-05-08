/**
 * DEV-ONLY: generates plausible-looking but random annotation data for a
 * PnmlNet. Import only from App.tsx (or other dev entry points) — never from
 * production feature code.
 */

import type { PnmlNet } from "../types/pnml";
import type { PetriNetAnnotations } from "../types/pnmlAnnotations.ts";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalDist(buckets: number): number[] {
  const peak   = randInt(Math.floor(buckets * 0.2), Math.floor(buckets * 0.7));
  const spread = 0.8 + Math.random() * 2;
  return Array.from({ length: buckets }, (_, i) => {
    const x = (i - peak) / spread;
    return Math.max(0, Math.round(100 * Math.exp(-0.5 * x * x)));
  });
}

function skewedDist(buckets: number): number[] {
  const halfLife = buckets / (1.5 + Math.random() * 3);
  return Array.from({ length: buckets }, (_, i) =>
    Math.max(0, Math.round(100 * Math.exp(-i / halfLife)))
  );
}

function randomDist(buckets: number): number[] {
  return Math.random() < 0.5 ? normalDist(buckets) : skewedDist(buckets);
}

export function generateDummyAnnotations(net: PnmlNet): PetriNetAnnotations {
  const baseCases = randInt(300, 3000);

  const places: PetriNetAnnotations["places"] = {};
  for (const place of net.places) {
    places[place.id] = {
      caseFrequency: Math.round(baseCases * (0.4 + Math.random() * 0.6)),
      distribution:  randomDist(8),
    };
  }

  const transitions: PetriNetAnnotations["transitions"] = {};
  for (const transition of net.transitions) {
    transitions[transition.id] = {
      firingCount:  Math.round(baseCases * (0.4 + Math.random() * 0.6)),
      avgDuration:  Math.round(60 + Math.random() * 86400),
      distribution: randomDist(8),
    };
  }

  const arcs: PetriNetAnnotations["arcs"] = {};
  for (const arc of net.arcs) {
    arcs[arc.id] = {
      flowCount: Math.round(baseCases * (0.3 + Math.random() * 0.7)),
    };
  }

  return { places, transitions, arcs };
}
