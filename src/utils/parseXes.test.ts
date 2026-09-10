import { describe, it, expect } from "vitest";
import { parseXes } from "./parseXes";

describe("parseXes", () => {
  it("reads traces and their events", () => {
    const traces = parseXes(`
      <log>
        <trace>
          <string key="concept:name" value="case-1"/>
          <event>
            <string key="concept:name" value="Register"/>
            <string key="org:resource" value="alice"/>
          </event>
          <event><string key="concept:name" value="Approve"/></event>
        </trace>
      </log>
    `);

    expect(traces).toHaveLength(1);
    expect(traces[0].id).toBe("case-1");
    expect(traces[0].events).toEqual([
      { "concept:name": "Register", "org:resource": "alice" },
      { "concept:name": "Approve" },
    ]);
  });

  it("reads every trace in the log", () => {
    const traces = parseXes(`
      <log>
        <trace><string key="concept:name" value="case-1"/></trace>
        <trace><string key="concept:name" value="case-2"/></trace>
      </log>
    `);

    expect(traces.map((t) => t.id)).toEqual(["case-1", "case-2"]);
  });

  it("falls back to 'unnamed' when a trace has no concept:name", () => {
    const traces = parseXes(`<log><trace><event/></trace></log>`);
    expect(traces[0].id).toBe("unnamed");
  });

  // A concept:name on an *event* must not be mistaken for the trace's own name,
  // which is why the lookup is scoped to direct children.
  it("does not take a trace name from a nested event", () => {
    const traces = parseXes(`
      <log>
        <trace>
          <event><string key="concept:name" value="Register"/></event>
        </trace>
      </log>
    `);

    expect(traces[0].id).toBe("unnamed");
  });

  // Likewise the event lookup: anything below the trace's immediate children
  // (a nested sub-log, say) belongs to that structure, not to this trace.
  it("only collects events that are direct children of the trace", () => {
    const traces = parseXes(`
      <log>
        <trace>
          <string key="concept:name" value="case-1"/>
          <event><string key="concept:name" value="Direct"/></event>
          <list><event><string key="concept:name" value="Nested"/></event></list>
        </trace>
      </log>
    `);

    expect(traces[0].events).toEqual([{ "concept:name": "Direct" }]);
  });

  it("reads attributes of any XES type, not just strings", () => {
    const traces = parseXes(`
      <log>
        <trace>
          <string key="concept:name" value="case-1"/>
          <event>
            <date key="time:timestamp" value="2024-01-01T00:00:00Z"/>
            <int key="cost" value="42"/>
          </event>
        </trace>
      </log>
    `);

    expect(traces[0].events[0]).toEqual({
      "time:timestamp": "2024-01-01T00:00:00Z",
      cost: "42",
    });
  });

  it("skips attributes that have no key or no value", () => {
    const traces = parseXes(`
      <log>
        <trace>
          <string key="concept:name" value="case-1"/>
          <event>
            <string key="kept" value="yes"/>
            <string key="no-value"/>
            <string value="no-key"/>
          </event>
        </trace>
      </log>
    `);

    expect(traces[0].events[0]).toEqual({ kept: "yes" });
  });

  it("returns nothing for a log with no traces", () => {
    expect(parseXes(`<log/>`)).toEqual([]);
  });

  it("throws on malformed XML", () => {
    expect(() => parseXes(`<log><trace></log>`)).toThrow(/Invalid XES file/);
  });
});
