import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ZipPnmlFile } from "../types/pnml";

export function useZipContents(selectedFile: string | null) {
  const [pnmlFiles, setPnmlFiles] = useState<ZipPnmlFile[] | null>(null);

  useEffect(() => {
    if (!selectedFile?.toLowerCase().endsWith(".zip")) {
      setPnmlFiles(null);
      return;
    }
    let stale = false;
    invoke<ZipPnmlFile[]>("read_zip_pnmls", { path: selectedFile })
      .then((files) => { if (!stale) setPnmlFiles(files); })
      .catch(() => { if (!stale) setPnmlFiles([]); });
    return () => { stale = true; };
  }, [selectedFile]);

  return { pnmlFiles };
}