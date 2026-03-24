export interface XesEvent {
  [attribute: string]: string;
}

export interface XesTrace {
  id: string;
  events: XesEvent[];
}

export interface XesVariant {
  key: string;        // activity sequence joined as a string, used as unique id
  label: string;      // "Variant 1", "Variant 2", …
  count: number;      // number of traces with this sequence
  events: XesEvent[]; // representative events (from the first matching trace)
  traceIds: string[];
}