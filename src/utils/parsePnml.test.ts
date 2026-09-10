import { describe, it, expect } from "vitest";
import { parsePnml } from "./parsePnml";

const net = (body: string, netAttrs = `id="n1"`) =>
  `<pnml><net ${netAttrs}>${body}</net></pnml>`;

describe("parsePnml", () => {
  it("reads a net with places, transitions and arcs", () => {
    const result = parsePnml(net(`
      <name><text>Order handling</text></name>
      <place id="p1"><name><text>start</text></name><initialMarking><text>1</text></initialMarking></place>
      <place id="p2"><name><text>end</text></name></place>
      <transition id="t1"><name><text>Approve</text></name></transition>
      <arc id="a1" source="p1" target="t1"/>
      <arc id="a2" source="t1" target="p2"/>
    `));

    expect(result.id).toBe("n1");
    expect(result.name).toBe("Order handling");
    expect(result.places).toEqual([
      { id: "p1", name: "start", initialMarking: 1 },
      { id: "p2", name: "end", initialMarking: 0 },
    ]);
    expect(result.transitions).toEqual([{ id: "t1", name: "Approve" }]);
    expect(result.arcs).toEqual([
      { id: "a1", source: "p1", target: "t1", inscription: 1 },
      { id: "a2", source: "t1", target: "p2", inscription: 1 },
    ]);
  });

  it("falls back to the net id when the net has no name", () => {
    expect(parsePnml(net(`<place id="p1"/>`)).name).toBe("n1");
  });

  it("falls back to 'net' when the net has no id either", () => {
    const result = parsePnml(net(`<place id="p1"/>`, ""));
    expect(result.id).toBe("net");
    expect(result.name).toBe("net");
  });

  // The net's own name is a direct child; a place called "start" further down
  // must not be picked up as the name of the whole net.
  it("does not take the net name from a nested element", () => {
    const result = parsePnml(net(`
      <place id="p1"><name><text>start</text></name></place>
    `));

    expect(result.name).toBe("n1");
  });

  it("names places and transitions after their id when unnamed", () => {
    const result = parsePnml(net(`
      <place id="p1"/>
      <place id="p2"><name><text></text></name></place>
      <transition id="t1"/>
    `));

    expect(result.places.map((p) => p.name)).toEqual(["p1", "p2"]);
    expect(result.transitions[0].name).toBe("t1");
  });

  it("skips nodes without an id", () => {
    const result = parsePnml(net(`
      <place id="p1"/>
      <place/>
      <transition/>
    `));

    expect(result.places).toHaveLength(1);
    expect(result.transitions).toHaveLength(0);
  });

  it("defaults a missing or unparseable initial marking to 0", () => {
    const result = parsePnml(net(`
      <place id="p1"/>
      <place id="p2"><initialMarking><text>many</text></initialMarking></place>
      <place id="p3"><initialMarking><text>3</text></initialMarking></place>
    `));

    expect(result.places.map((p) => p.initialMarking)).toEqual([0, 0, 3]);
  });

  it("reads arc inscriptions", () => {
    const result = parsePnml(net(`
      <arc id="a1" source="p1" target="t1"><inscription><text>5</text></inscription></arc>
    `));

    expect(result.arcs[0].inscription).toBe(5);
  });

  // An arc weight of 0 is not meaningful in a Petri net, so it collapses into
  // the default of 1 along with a missing or unparseable inscription.
  it("defaults a missing, zero or unparseable inscription to 1", () => {
    const result = parsePnml(net(`
      <arc id="a1" source="p1" target="t1"/>
      <arc id="a2" source="p1" target="t1"><inscription><text>0</text></inscription></arc>
      <arc id="a3" source="p1" target="t1"><inscription><text>none</text></inscription></arc>
    `));

    expect(result.arcs.map((a) => a.inscription)).toEqual([1, 1, 1]);
  });

  it("defaults empty source and target to empty strings", () => {
    const result = parsePnml(net(`<arc id="a1"/>`));
    expect(result.arcs[0]).toEqual({ id: "a1", source: "", target: "", inscription: 1 });
  });

  // Arc ids are used as React keys, so they have to be unique even when the
  // file gives no id at all or repeats one.
  it("synthesises an id for arcs that have none", () => {
    const result = parsePnml(net(`
      <arc source="p1" target="t1"/>
      <arc id="a1" source="t1" target="p2"/>
    `));

    expect(result.arcs.map((a) => a.id)).toEqual(["arc__0", "a1"]);
  });

  it("renames duplicate arc ids", () => {
    const result = parsePnml(net(`
      <arc id="a1" source="p1" target="t1"/>
      <arc id="a1" source="t1" target="p2"/>
    `));

    expect(result.arcs.map((a) => a.id)).toEqual(["a1", "arc__1"]);
  });

  // Large nets are usually split across <page> elements. Those are a layout
  // device, not a scoping one: the nodes inside still belong to the net.
  it("finds nodes nested inside a page", () => {
    const result = parsePnml(net(`
      <place id="p1"/>
      <page id="pg1">
        <place id="p2"/>
        <transition id="t1"/>
        <arc id="a1" source="p2" target="t1"/>
      </page>
    `));

    expect(result.places.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(result.transitions.map((t) => t.id)).toEqual(["t1"]);
    expect(result.arcs.map((a) => a.id)).toEqual(["a1"]);
  });

  it("returns empty collections for an empty net", () => {
    const result = parsePnml(net(``));
    expect(result.places).toEqual([]);
    expect(result.transitions).toEqual([]);
    expect(result.arcs).toEqual([]);
  });

  it("throws when there is no net element", () => {
    expect(() => parsePnml(`<pnml/>`)).toThrow(/No <net> element found/);
  });

  it("throws on malformed XML", () => {
    expect(() => parsePnml(`<pnml><net></pnml>`)).toThrow(/Invalid PNML/);
  });
});
