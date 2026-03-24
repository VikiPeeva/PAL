import { useMemo } from "react";
import { parseXes } from "../utils/parseXes";
import { groupVariants } from "../utils/groupVariants";
import type { XesTrace, XesVariant } from "../types/xes";

export function useEventLog(selectedFile: string | null, rawContent: string | null) {
  const parsedLog = useMemo<XesTrace[] | null>(() => {
    if (!selectedFile || !rawContent) return null;
    if (!selectedFile.toLowerCase().endsWith(".xes")) return null;
    try {
      return parseXes(rawContent);
    } catch {
      return null;
    }
  }, [selectedFile, rawContent]);

  const variants = useMemo<XesVariant[]>(
    () => (parsedLog ? groupVariants(parsedLog) : []),
    [parsedLog]
  );

  return { parsedLog, variants };
}