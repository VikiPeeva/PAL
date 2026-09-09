import type { XesEvent } from "../../types/xes";
import "./TraceChevrons.css";

interface Props {
  events: XesEvent[];
  activityColors: Map<string, string>;
}

export function TraceChevrons({ events, activityColors }: Props) {
  return (
    <div className="chevron-strip">
      {events.map((event, i) => {
        const activity = event["concept:name"] ?? "?";
        // Left unset when the activity has no palette entry, so the CSS
        // fallback (--color-unassigned) applies rather than a second default.
        const color = activityColors.get(activity);
        return (
          <div
            key={i}
            title={activity}
            className={`chevron${i === 0 ? " chevron-first" : ""}`}
            style={{ "--chevron-color": color } as React.CSSProperties}
          >
            <span className="chevron-label">{activity}</span>
          </div>
        );
      })}
    </div>
  );
}