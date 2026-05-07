import type { PnmlNet, PnmlPlace, PnmlTransition, PnmlArc } from "../types/pnml";

function getText(el: Element, selector: string): string {
  return el.querySelector(`${selector} > text`)?.textContent?.trim() ?? "";
}

export function parsePnml(xml: string): PnmlNet {
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) throw new Error("Invalid PNML: " + parserError.textContent);

  const netEl = doc.querySelector("pnml > net");
  if (!netEl) throw new Error("No <net> element found");

  const netId   = netEl.getAttribute("id") ?? "net";
  const netName = getText(netEl, ":scope > name") || netId;

  const places: PnmlPlace[] = Array.from(netEl.querySelectorAll("place"))
    .filter((el) => el.hasAttribute("id"))
    .map((el) => ({
      id:             el.getAttribute("id")!,
      name:           getText(el, "name") || el.getAttribute("id")!,
      initialMarking: parseInt(getText(el, "initialMarking") || "0", 10) || 0,
    }));

  const transitions: PnmlTransition[] = Array.from(netEl.querySelectorAll("transition"))
    .filter((el) => el.hasAttribute("id"))
    .map((el) => ({
      id:   el.getAttribute("id")!,
      name: getText(el, "name") || el.getAttribute("id")!,
    }));

  const arcs: PnmlArc[] = Array.from(netEl.querySelectorAll("arc")).map((el) => ({
    id:          el.getAttribute("id") ?? "",
    source:      el.getAttribute("source") ?? "",
    target:      el.getAttribute("target") ?? "",
    inscription: parseInt(getText(el, "inscription") || "1", 10) || 1,
  }));

  return { id: netId, name: netName, places, transitions, arcs };
}