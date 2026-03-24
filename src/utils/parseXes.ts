import type { XesEvent, XesTrace } from "../types/xes";

export function parseXes(xml: string): XesTrace[] {
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) throw new Error("Invalid XES file: " + parserError.textContent);

  return Array.from(doc.querySelectorAll("log > trace")).map((traceEl) => {
    const nameEl = traceEl.querySelector(':scope > string[key="concept:name"]');
    const id = nameEl?.getAttribute("value") ?? "unnamed";

    const events: XesEvent[] = Array.from(traceEl.querySelectorAll(":scope > event")).map((eventEl) => {
      const attrs: XesEvent = {};
      for (const child of eventEl.children) {
        const key = child.getAttribute("key");
        const value = child.getAttribute("value");
        if (key && value !== null) attrs[key] = value;
      }
      return attrs;
    });

    return { id, events };
  });
}