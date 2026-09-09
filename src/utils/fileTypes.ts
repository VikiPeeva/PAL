export type FileKind = "eventLog" | "petriNet" | "archive";

export interface FileTypeSpec {
  kind:  FileKind;
  label: string;
  color: string;
}

/**
 * Every supported file type, in one place: classification, the accepted
 * extension list and the file-bar badge all derive from this table, so adding
 * a format means adding one entry here.
 *
 * `.apnml` is an *accepting* Petri net (a net plus final markings), not an
 * annotated one — it is unrelated to the annotation overlay fed by
 * services/annotationsProvider.ts. Mapping it to the same kind as `.pnml` is
 * deliberate: it is handled exactly like plain PNML for now, and accepting
 * markings are not parsed.
 */
export const FILE_TYPES = {
  xes:   { kind: "eventLog", label: "XES", color: "#4c6ef5" },
  pnml:  { kind: "petriNet", label: "PNL", color: "#37b24d" },
  apnml: { kind: "petriNet", label: "APN", color: "#ae3ec9" },
  zip:   { kind: "archive",  label: "ZIP", color: "#f59e0b" },
} as const satisfies Record<string, FileTypeSpec>;

export type FileExtension = keyof typeof FILE_TYPES;

export const ALLOWED_EXTENSIONS = Object.keys(FILE_TYPES) as FileExtension[];

/** Basename of a path, handling both Windows and POSIX separators. */
export const fileName = (path: string): string =>
  path.replace(/\\/g, "/").split("/").pop() ?? path;

/** Lowercased extension of a path, or "" if it has none. */
export const fileExtension = (path: string): string => {
  const name = fileName(path);
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
};

/** Table entry for a path's extension, or undefined if it isn't supported. */
export const fileTypeOf = (path: string): FileTypeSpec | undefined =>
  FILE_TYPES[fileExtension(path) as FileExtension];

/** The kind a path maps to, or undefined if it isn't supported. */
export const fileKindOf = (path: string): FileKind | undefined =>
  fileTypeOf(path)?.kind;
