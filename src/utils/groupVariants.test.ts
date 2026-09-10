import { describe, it, expect } from "vitest";
import { groupVariants } from "./groupVariants";
import type { XesTrace } from "../types/xes";

/** Builds a trace whose events are just the named activities, in order. */
const trace = (id: string, ...activities: string[]): XesTrace => ({
  id,
  events: activities.map((name) => ({ "concept:name": name })),
});

describe("groupVariants", () => {
  it("returns nothing for an empty log", () => {
    expect(groupVariants([])).toEqual([]);
  });

  it("groups traces that share an activity sequence", () => {
    const variants = groupVariants([
      trace("t1", "A", "B"),
      trace("t2", "A", "B"),
      trace("t3", "A", "C"),
    ]);

    expect(variants).toHaveLength(2);
    expect(variants[0].count).toBe(2);
    expect(variants[0].traceIds).toEqual(["t1", "t2"]);
    expect(variants[1].count).toBe(1);
    expect(variants[1].traceIds).toEqual(["t3"]);
  });

  it("treats a different order as a different variant", () => {
    const variants = groupVariants([trace("t1", "A", "B"), trace("t2", "B", "A")]);
    expect(variants).toHaveLength(2);
  });

  it("sorts most frequent first", () => {
    const variants = groupVariants([
      trace("t1", "rare"),
      trace("t2", "common"),
      trace("t3", "common"),
    ]);

    expect(variants.map((v) => v.count)).toEqual([2, 1]);
    expect(variants[0].traceIds).toEqual(["t2", "t3"]);
  });

  // The label is assigned after sorting, so "Variant 1" always means the most
  // frequent variant rather than the first one encountered in the log.
  it("labels by frequency rank, not by order of appearance", () => {
    const variants = groupVariants([
      trace("t1", "rare"),
      trace("t2", "common"),
      trace("t3", "common"),
    ]);

    expect(variants[0].label).toBe("Variant 1");
    expect(variants[0].key).toBe("common");
    expect(variants[1].label).toBe("Variant 2");
    expect(variants[1].key).toBe("rare");
  });

  it("keeps first-seen order between variants of equal count", () => {
    const variants = groupVariants([trace("t1", "A"), trace("t2", "B")]);
    expect(variants.map((v) => v.key)).toEqual(["A", "B"]);
  });

  it("substitutes ? for an event with no concept:name", () => {
    const variants = groupVariants([
      { id: "t1", events: [{ "concept:name": "A" }, { "lifecycle:transition": "complete" }] },
    ]);

    expect(variants[0].key).toBe("A|?");
  });

  it("keeps the events of the first trace in the group as the exemplar", () => {
    const variants = groupVariants([
      { id: "t1", events: [{ "concept:name": "A", "org:resource": "alice" }] },
      { id: "t2", events: [{ "concept:name": "A", "org:resource": "bob" }] },
    ]);

    expect(variants).toHaveLength(1);
    expect(variants[0].events[0]["org:resource"]).toBe("alice");
  });

  it("groups an empty trace under the empty key", () => {
    const variants = groupVariants([trace("t1"), trace("t2")]);
    expect(variants).toHaveLength(1);
    expect(variants[0].key).toBe("");
    expect(variants[0].count).toBe(2);
  });
});
