import { ANNOTATION_GROUPS, type AnnotationKey } from "../../types/pnmlAnnotations";
import "./AnnotationSelector.css";

interface Props {
  enabledColors: ReadonlyMap<AnnotationKey, string>;
  onToggle:      (key: AnnotationKey) => void;
}

export function AnnotationSelector({ enabledColors, onToggle }: Props) {
  return (
    <div className="ann-selector">
      {ANNOTATION_GROUPS.map(group => {
        const activeCount = group.items.filter(i => enabledColors.has(i.key)).length;
        return (
          <div key={group.label} className="ann-group">
            <span className="ann-group-label">{group.label}</span>
            <div className="ann-chips">
              {group.items.map(({ key, label }) => {
                const color      = enabledColors.get(key);
                const isActive   = color !== undefined;
                const isDisabled = !isActive && activeCount >= 2;
                const btn = (
                  <button
                    className={`ann-chip${isActive ? " active" : ""}`}
                    disabled={isDisabled}
                    style={isActive ? { background: color, borderColor: color } : undefined}
                    onClick={() => onToggle(key)}
                  >
                    {label}
                  </button>
                );
                return isDisabled ? (
                  <span key={key} className="ann-chip-wrap" title="Maximum two annotations per group">
                    {btn}
                  </span>
                ) : (
                  <span key={key} className="ann-chip-wrap">{btn}</span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}