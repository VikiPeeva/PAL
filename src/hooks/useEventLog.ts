import { useMemo } from "react";
import { parseXes } from "../utils/parseXes";
import { groupVariants } from "../utils/groupVariants";
import type { XesTrace, XesVariant } from "../types/xes";

export function useEventLog(selectedFile: string | null, rawContent: string | null) {
  const { parsedLog, error } = useMemo<{ parsedLog: XesTrace[] | null; error: string | null }>(() => {
    if (!selectedFile || !rawContent) return { parsedLog: null, error: null };
    if (!selectedFile.toLowerCase().endsWith(".xes")) return { parsedLog: null, error: null };
    try {
      return { parsedLog: parseXes(rawContent), error: null };
    } catch (e) {
      return { parsedLog: null, error: e instanceof Error ? e.message : String(e) };
    }
  }, [selectedFile, rawContent]);

  const variants = useMemo<XesVariant[]>(
    () => (parsedLog ? groupVariants(parsedLog) : []),
    [parsedLog]
  );

  return { parsedLog, variants, error };
}