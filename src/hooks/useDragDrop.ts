import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ALLOWED_EXTENSIONS } from "../constants/fileExtensions.ts";

export function useDragDrop(onDrop: (paths: string[]) => void) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

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
        if (paths.length > 0) onDrop(paths);
      }
    }).then((fn) => { unlisten = fn; });

    return () => unlisten?.();
  }, []);

  return { isDragging };
}