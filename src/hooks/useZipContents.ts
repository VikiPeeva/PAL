import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { fileKindOf } from "../utils/fileTypes";
import type { ZipPnmlFile } from "../types/pnml";

export function useZipContents(selectedFile: string | null) {
  // Tagged with the path it was read from, so results from a superseded
  // selection can be told apart from the current one at render time.
  const [loaded, setLoaded] = useState<{ path: string; files: ZipPnmlFile[] } | null>(null);
  const isArchive = selectedFile !== null && fileKindOf(selectedFile) === "archive";

  useEffect(() => {
    if (!isArchive || selectedFile === null) return;
    let cancelled = false;
    invoke<ZipPnmlFile[]>("read_zip_pnmls", { path: selectedFile })
      .then((files) => { if (!cancelled) setLoaded({ path: selectedFile, files }); })
      .catch(() => { if (!cancelled) setLoaded({ path: selectedFile, files: [] }); });
    return () => { cancelled = true; };
  }, [selectedFile, isArchive]);

  const pnmlFiles = isArchive && loaded?.path === selectedFile ? loaded.files : null;

  return { pnmlFiles };
}
