# Pattern Analysis Lens (PAL)

A desktop tool for exploring process mining event logs, built with Tauri, React, and TypeScript.

## Features

- **Add files** via the `+ Add` button or drag-and-drop — supports `.xes`, `.pnml`, and `.apnml`
- **Variant explorer** — groups traces by activity sequence and visualizes each variant as a chevron flow, color-coded by activity
- **File bar** — all open files shown at the bottom with type badges and quick remove

## Running locally

```bash
pnpm install
pnpm tauri dev
```