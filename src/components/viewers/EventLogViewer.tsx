import { useMemo } from "react";
import type { XesVariant } from "../../types/xes";
import { TraceChevrons } from "../shared/TraceChevrons";
import "./EventLogViewer.css";

interface Props {
  variants: XesVariant[];
}

const PALETTE = ["#4c6ef5", "#f03e3e", "#37b24d", "#f59f00", "#ae3ec9", "#1098ad", "#e67700", "#d6336c"];

function buildActivityColors(variants: XesVariant[]): Map<string, string> {
  const activities: string[] = [];
  for (const v of variants)
    for (const event of v.events) {
      const name = event["concept:name"];
      if (name && !activities.includes(name)) activities.push(name);
    }
  return new Map(activities.map((a, i) => [a, PALETTE[i % PALETTE.length]]));
}

export function EventLogViewer({ variants }: Props) {
  const activityColors = useMemo(() => buildActivityColors(variants), [variants]);

  return (
    <div className="variant-list">
      {variants.map((v) => (
        <div key={v.key} className="variant-row">
          <span className="variant-count">{v.count}×</span>
          <TraceChevrons events={v.events} activityColors={activityColors} />
        </div>
      ))}
    </div>
  );
}