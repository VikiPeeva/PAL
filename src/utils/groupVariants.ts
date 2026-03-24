import type { XesTrace, XesVariant } from "../types/xes";

export function groupVariants(traces: XesTrace[]): XesVariant[] {
  const map = new Map<string, XesVariant>();

  for (const trace of traces) {
    const key = trace.events.map((e) => e["concept:name"] ?? "?").join("|");
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.traceIds.push(trace.id);
    } else {
      map.set(key, {
        key,
        label: "",        // assigned after sorting
        count: 1,
        events: trace.events,
        traceIds: [trace.id],
      });
    }
  }

  // Sort most frequent first, then assign stable labels
  const sorted = [...map.values()].sort((a, b) => b.count - a.count);
  sorted.forEach((v, i) => { v.label = `Variant ${i + 1}`; });
  return sorted;
}