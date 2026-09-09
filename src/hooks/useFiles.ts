import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ALLOWED_EXTENSIONS, fileKindOf } from "../utils/fileTypes";
import { useStaleGuard } from "./useStaleGuard";
import type { ZipPnmlFile } from "../types/pnml";

/**
 * Result of loading the selected file's bytes. `null` means nothing is
 * selected — distinct from "loading", so the UI can tell the two apart.
 */
export type LoadedFile =
  | { status: "loading" }
  | { status: "text";    content: string }
  | { status: "archive"; pnmlFiles: ZipPnmlFile[] }
  | { status: "error";   message: string };

export function useFiles() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedFile | null>(null);
  const { markCurrent, isCurrent } = useStaleGuard<string | null>();

  const addPaths = (paths: string[]) => {
    setUploadedFiles((prev) => {
      const existing = new Set(prev);
      return [...prev, ...paths.filter((p) => !existing.has(p))];
    });
  };

  const handleAddFiles = async () => {
    const paths: string[] = await invoke("pick_files", { extensions: ALLOWED_EXTENSIONS });
    if (paths.length > 0) addPaths(paths);
  };

  const handleSelectFile = async (path: string) => {
    markCurrent(path);
    setSelectedFile(path);
    setLoaded({ status: "loading" });
    try {
      // One place decides how a file's bytes are fetched; the kind picks the command.
      const next: LoadedFile =
        fileKindOf(path) === "archive"
          ? { status: "archive", pnmlFiles: await invoke<ZipPnmlFile[]>("read_zip_pnmls", { path }) }
          : { status: "text", content: await invoke<string>("read_file", { path }) };
      if (isCurrent(path)) setLoaded(next);
    } catch (e) {
      if (isCurrent(path)) setLoaded({ status: "error", message: String(e) });
    }
  };

  const handleRemoveFile = (path: string) => {
    setUploadedFiles((prev) => prev.filter((p) => p !== path));
    if (selectedFile === path) {
      markCurrent(null);
      setSelectedFile(null);
      setLoaded(null);
    }
  };

  return { uploadedFiles, selectedFile, loaded, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile };
}
