import { useMemo } from "react";
import { useEventLog } from "./useEventLog";
import { usePetriNet } from "./usePetriNet";
import { annotationsProvider } from "../services/annotationsProvider";
import { fileName } from "../utils/fileTypes";
import type { LoadedFile } from "./useFiles";
import type { XesVariant } from "../types/xes";
import type { ZipPnmlFile } from "../types/pnml";
import type { AnnotatedPetriNet } from "../types/pnmlAnnotations";

/**
 * What the content area should show. Exactly one of these holds at any moment,
 * so the render is a single switch instead of a chain of mutually exclusive
 * conditions — and adding a case here won't compile until it is handled.
 */
export type FileContent =
  | { status: "empty" }
  | { status: "loading";      fileName: string }
  | { status: "readError";    message: string }
  | { status: "eventLog";     variants: XesVariant[] }
  | { status: "petriNet";     net: AnnotatedPetriNet }
  | { status: "archive";      pnmlFiles: ZipPnmlFile[] }
  | { status: "emptyArchive" }
  | { status: "raw";          content: string; parseError: string | null };

export function useFileContent(
  selectedFile: string | null,
  loaded: LoadedFile | null,
): FileContent {
  const rawContent = loaded?.status === "text" ? loaded.content : null;

  const { parsedLog, variants, error: xesError } = useEventLog(selectedFile, rawContent);
  const { annotatedNet, error: pnmlError } = usePetriNet(selectedFile, rawContent, annotationsProvider);

  return useMemo<FileContent>(() => {
    if (loaded === null) return { status: "empty" };

    switch (loaded.status) {
      case "loading":
        return { status: "loading", fileName: selectedFile ? fileName(selectedFile) : "" };
      case "error":
        return { status: "readError", message: loaded.message };
      case "archive":
        return loaded.pnmlFiles.length > 0
          ? { status: "archive", pnmlFiles: loaded.pnmlFiles }
          : { status: "emptyArchive" };
      case "text":
        if (parsedLog) return { status: "eventLog", variants };
        if (annotatedNet) return { status: "petriNet", net: annotatedNet };
        return { status: "raw", content: loaded.content, parseError: xesError ?? pnmlError };
    }
  }, [loaded, selectedFile, parsedLog, variants, annotatedNet, xesError, pnmlError]);
}
