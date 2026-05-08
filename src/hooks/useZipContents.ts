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
    invoke<ZipPnmlFile[]>("read_zip_pnmls", { path: selectedFile })
      .then(setPnmlFiles)
      .catch(() => setPnmlFiles([]));
  }, [selectedFile]);

  return { pnmlFiles };
}