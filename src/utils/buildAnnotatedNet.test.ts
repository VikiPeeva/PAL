import { describe, it, expect, vi } from "vitest";
import { buildAnnotatedNet } from "./buildAnnotatedNet";
import type { PnmlNet } from "../types/pnml";
import type { PetriNetAnnotations } from "../types/pnmlAnnotations";

const PNML = `<pnml><net id="n1">
  <name><text>Order handling</text></name>
  <place id="p1"/>
  <transition id="t1"/>
</net></pnml>`;

describe("buildAnnotatedNet", () => {
  it("returns the parsed net", () => {
    const { net } = buildAnnotatedNet(PNML);
    expect(net.id).toBe("n1");
    expect(net.name).toBe("Order handling");
    expect(net.places.map((p) => p.id)).toEqual(["p1"]);
  });

  it("leaves annotations undefined when no provider is given", () => {
    expect(buildAnnotatedNet(PNML).annotations).toBeUndefined();
  });

  it("passes the parsed net to the provider and returns what it gives back", () => {
    const annotations: PetriNetAnnotations = {
      places:      { p1: { caseFrequency: 7 } },
      transitions: { t1: { firingCount: 7 } },
      arcs:        {},
    };
    const getAnnotations = vi.fn<(net: PnmlNet) => PetriNetAnnotations>(() => annotations);

    const result = buildAnnotatedNet(PNML, getAnnotations);

    expect(getAnnotations).toHaveBeenCalledOnce();
    expect(getAnnotations.mock.calls[0][0]).toBe(result.net);
    expect(result.annotations).toBe(annotations);
  });

  // A provider that has nothing to say for this net is not an error: the
  // viewer just renders the net without an overlay.
  it("keeps annotations undefined when the provider returns nothing", () => {
    expect(buildAnnotatedNet(PNML, () => undefined).annotations).toBeUndefined();
  });

  // Parse failures are deliberately not swallowed here; callers decide how to
  // surface them.
  it("propagates a parse failure", () => {
    expect(() => buildAnnotatedNet(`<pnml/>`)).toThrow(/No <net> element found/);
  });
});
