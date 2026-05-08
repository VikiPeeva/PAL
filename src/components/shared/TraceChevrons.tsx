import type { XesEvent } from "../../types/xes";

interface Props {
  events: XesEvent[];
  activityColors: Map<string, string>;
}

export function TraceChevrons({ events, activityColors }: Props) {
  return (
    <div className="chevron-strip">
      {events.map((event, i) => {
        const activity = event["concept:name"] ?? "?";
        const color = activityColors.get(activity) ?? "#888";
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