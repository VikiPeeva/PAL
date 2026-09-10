import { describe, it, expect } from "vitest";
import {
  ALLOWED_EXTENSIONS,
  FILE_TYPES,
  fileExtension,
  fileKindOf,
  fileName,
  fileTypeOf,
} from "./fileTypes";

describe("fileName", () => {
  it("takes the basename of a POSIX path", () => {
    expect(fileName("/home/peeva/logs/order.xes")).toBe("order.xes");
  });

  it("takes the basename of a Windows path", () => {
    expect(fileName("C:\\Users\\peeva\\logs\\order.xes")).toBe("order.xes");
  });

  it("handles a path that mixes both separators", () => {
    expect(fileName("C:\\Users\\peeva/logs\\order.xes")).toBe("order.xes");
  });

  it("returns a bare filename unchanged", () => {
    expect(fileName("order.xes")).toBe("order.xes");
  });
});

describe("fileExtension", () => {
  it("lowercases the extension", () => {
    expect(fileExtension("ORDER.XES")).toBe("xes");
  });

  it("returns an empty string when there is no extension", () => {
    expect(fileExtension("Makefile")).toBe("");
  });

  it("ignores dots in parent directories", () => {
    expect(fileExtension("C:\\my.data\\logfile")).toBe("");
  });

  it("takes only the last extension", () => {
    expect(fileExtension("archive.tar.gz")).toBe("gz");
  });

  // Current behaviour, not necessarily desired: a dotfile reads as being all
  // extension, so ".xes" classifies as an event log. Harmless while none of
  // the supported formats are ever dotfiles.
  it("treats a leading dot as an extension", () => {
    expect(fileExtension(".xes")).toBe("xes");
  });
});

describe("fileTypeOf / fileKindOf", () => {
  it("maps a known extension to its spec", () => {
    expect(fileTypeOf("order.xes")).toEqual(FILE_TYPES.xes);
  });

  it("is case-insensitive", () => {
    expect(fileKindOf("ORDER.XES")).toBe("eventLog");
  });

  it("returns undefined for an unsupported extension", () => {
    expect(fileTypeOf("notes.txt")).toBeUndefined();
    expect(fileKindOf("notes.txt")).toBeUndefined();
  });

  it("returns undefined for a file with no extension", () => {
    expect(fileKindOf("Makefile")).toBeUndefined();
  });

  // .apnml is an *accepting* Petri net (a net plus final markings). Handling
  // it exactly like .pnml is a deliberate decision, not an oversight.
  it("maps .apnml to the same kind as .pnml", () => {
    expect(fileKindOf("model.apnml")).toBe("petriNet");
    expect(fileKindOf("model.apnml")).toBe(fileKindOf("model.pnml"));
  });

  it("maps an archive to its own kind", () => {
    expect(fileKindOf("models.zip")).toBe("archive");
  });
});

describe("ALLOWED_EXTENSIONS", () => {
  // The file dialog filter, the drag-drop filter and the badge all read from
  // FILE_TYPES; this is what keeps them from drifting apart.
  it("lists exactly the keys of FILE_TYPES", () => {
    expect([...ALLOWED_EXTENSIONS].sort()).toEqual(Object.keys(FILE_TYPES).sort());
  });

  it("only contains extensions that classify", () => {
    for (const ext of ALLOWED_EXTENSIONS) {
      expect(fileKindOf(`file.${ext}`)).toBeDefined();
    }
  });
});
