import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ALLOWED_EXTENSIONS } from "../constants/fileExtensions.ts";

export function useFiles() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);

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
    setSelectedFile(path);
    setRawContent(null);
    try {
      const content: string = await invoke("read_file", { path });
      setRawContent(content);
    } catch (e) {
      setRawContent(`Error reading file: ${e}`);
    }
  };

  const handleRemoveFile = (path: string) => {
    setUploadedFiles((prev) => prev.filter((p) => p !== path));
    if (selectedFile === path) {
      setSelectedFile(null);
      setRawContent(null);
    }
  };

  const fileName = (path: string) =>
    path.replace(/\\/g, "/").split("/").pop() ?? path;

  return { uploadedFiles, selectedFile, rawContent, addPaths, handleAddFiles, handleSelectFile, handleRemoveFile, fileName };
}