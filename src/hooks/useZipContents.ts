import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { ZipPnmlFile } from "../types/pnml";
import { useStaleGuard } from "./useStaleGuard";

export function useZipContents(selectedFile: string | null) {
  const [pnmlFiles, setPnmlFiles] = useState<ZipPnmlFile[] | null>(null);
  const { markCurrent, isCurrent } = useStaleGuard<string | null>();

  useEffect(() => {
    markCurrent(selectedFile);
    if (!selectedFile?.toLowerCase().endsWith(".zip")) {
      setPnmlFiles(null);
      return;
    }
    invoke<ZipPnmlFile[]>("read_zip_pnmls", { path: selectedFile })
      .then((files) => { if (isCurrent(selectedFile)) setPnmlFiles(files); })
      .catch(() => { if (isCurrent(selectedFile)) setPnmlFiles([]); });
  }, [selectedFile]);

  return { pnmlFiles };
}