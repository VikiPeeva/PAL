import { useState, useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ALLOWED_EXTENSIONS } from "../constants/fileExtensions.ts";

export function useDragDrop(onDrop: (paths: string[]) => void) {
  const [isDragging, setIsDragging] = useState(false);

  // Held in a ref so a fresh callback identity doesn't tear down and
  // re-register the window listener on every render.
  const onDropRef = useRef(onDrop);
  useEffect(() => { onDropRef.current = onDrop; }, [onDrop]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    getCurrentWindow().onDragDropEvent((event) => {
      if (event.payload.type === "enter" || event.payload.type === "over") {
        setIsDragging(true);
      } else if (event.payload.type === "leave") {
        setIsDragging(false);
      } else if (event.payload.type === "drop") {
        setIsDragging(false);
        const paths = event.payload.paths.filter((p) =>
          ALLOWED_EXTENSIONS.includes(p.split(".").pop()?.toLowerCase() ?? "")
        );
        if (paths.length > 0) onDropRef.current(paths);
      }
    }).then((fn) => {
      // Registration can finish after cleanup ran; drop the listener rather than leak it.
      if (cancelled) fn();
      else unlisten = fn;
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return { isDragging };
}
