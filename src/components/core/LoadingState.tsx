import "./LoadingState.css";

interface Props {
  fileName: string;
}

export function LoadingState({ fileName }: Props) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="loading-state-text">Reading {fileName}…</p>
    </div>
  );
}
