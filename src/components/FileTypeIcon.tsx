const COLORS: Record<string, string> = {
  xes:   "#4c6ef5",
  pnml:  "#37b24d",
  apnml: "#ae3ec9",
};

const LABELS: Record<string, string> = {
  xes:   "XES",
  pnml:  "PNL",
  apnml: "APN",
};

interface Props {
  extension: string;
}

export function FileTypeIcon({ extension }: Props) {
  const ext = extension.toLowerCase();
  const color = COLORS[ext] ?? "#868e96";
  const label = LABELS[ext] ?? ext.slice(0, 3).toUpperCase();

  return (
    <span className="file-type-icon" style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}