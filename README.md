# Live Note Parameters

Fill in parameters directly in your notes, synchronize their values within each tab, and copy resolved commands. Persistent defaults stay in Markdown; temporary input stays in memory.

[中文说明](README.zh-CN.md)

## Features and results

- Edit parameters in Live Preview and Reading, with immediate synchronization throughout the current tab.
- Keep interactive syntax blocks alongside fixed examples. Copy the syntax block with current values and original quotes; fixed examples stay unchanged.
- Start a new tab with default values. Temporary input never changes the note or persists in plugin data.
- Maintain defaults through a collapsible panel with reference actions, draft/save/cancel and native Undo/Redo.
- Use existing code-block copy buttons and the optional Copy Inline Code 2.1.0 inline icon.

## Install

Desktop MVP. Requires Obsidian 1.13.7 or newer; validated on macOS with 1.13.7.

1. Download `main.js`, `manifest.json` and `styles.css` from [Releases](https://github.com/nestealin/obsidian-live-note-parameters/releases).
2. Place them in `<vault>/<config-dir>/plugins/live-note-parameters/` (the default config directory is `.obsidian`).
3. Reload Obsidian's community plugin list and enable **Live Note Parameters**.

The [official community listing](https://community.obsidian.md/plugins/live-note-parameters) has been submitted. In-app installation becomes available when the directory review permits it. BRAT users can add `nestealin/obsidian-live-note-parameters`; manual installation remains available during review.

## Write a parameterized note

Add defaults to the note's existing YAML frontmatter:

````markdown
---
doc_vars:
  PROJECT_ID: "demo-project"
  REGION: "us-central1"
---

Project: {{PROJECT_ID}}

Inline command: `gcloud --project="{{PROJECT_ID}}"`

```bash docvars
gcloud compute backend-services list \
  --project="{{PROJECT_ID}}" \
  --regions="{{REGION}}"
```

```bash
gcloud compute backend-services list --project="example-project"
```
````

- `{{NAME}}` references a parameter. Names contain letters, digits and underscores, starting with a letter or underscore.
- Only fenced blocks with the additional `docvars` info word opt in. Ordinary code blocks remain literal, so syntax and fixed examples can coexist.
- Values must be strings, one line, at most 512 characters. Quote dates, numeric strings and booleans in YAML. Expressions, nested values and YAML anchors in `doc_vars` are not supported.

See [the complete example](examples/live-note-parameters.md).

## Use

In **Live Preview** or **Reading**, click an underlined parameter to type. Other occurrences in the same tab update immediately. Empty input is an explicit empty value; press `Esc` to restore that parameter's default. The **重置当前标签页变量 (Reset current tab parameters)** command clears all overrides.

Switching between modes retains the current tab's values. A fresh tab starts at defaults. Source mode shows the original placeholders.

Existing code-block copy buttons copy the resolved values. With **Copy Inline Code 2.1.0** installed, its existing inline copy icon also copies resolved values. Clicking a parameter edits it; clicking the copy icon copies the entire inline snippet. Ordinary inline copying stays with the existing plugin. Without that optional plugin, this plugin does not add inline copy icons.

Parameters are substituted literally. Add the appropriate quoting for the command or format you are writing; this plugin does not perform shell escaping or execute copied commands.

## Maintain defaults in Live Preview

Expand **笔记参数 / Note parameters** above the editor, or use the note toolbar's sliders icon / **管理笔记参数 (Manage note parameters)** command.

- Add parameters, edit names/defaults, inspect reference counts, locate or insert references.
- Edits remain a draft until **Save definitions**. **Cancel** discards the draft.
- Renaming previews the affected reference count and updates eligible references in the same editor transaction. Fixed example blocks remain untouched.
- A referenced parameter cannot be deleted. Resolve its references first.
- Saving updates only the definition range and explicitly renamed references; unrelated frontmatter/body stay intact. One native undo restores the definition edit.
- Existing tab overrides are retained when defaults change. Untouched parameters and new tabs use the new defaults.
- A stale definition draft is rejected. Renames also reject changes to the body made since the draft started.

Legacy `<!-- doc-vars {...} -->` declarations render during transition. **Preview migration** shows the new frontmatter before explicitly applying one undoable edit that removes the old comment. Declaring both formats is an error; there is no hidden precedence.

## Data and compatibility

Temporary values belong to the current tab and stay in memory. They are not written to notes, plugin data, browser storage or workspace state. Defaults are ordinary note metadata. Copying writes to the system clipboard only after a copy action.

No network requests, telemetry, command execution or template evaluation. Rendering accesses only the opened note; protected private paths are skipped. Disabling the plugin restores readable Markdown placeholders.

MVP scope: desktop, the main application window, prose, inline code and ordinary top-level fenced blocks. Mobile, pop-out windows, transclusions, complex nested Markdown, all themes and all code-block plugin combinations have not been accepted. The minimum version reflects the tested renderer.

## Project maintenance

Use Node 22+ and the committed dependency lockfile. Keep `package.json`, `manifest.json`, `versions.json` and the changelog consistent. Product documentation describes supported features, observable behavior, usage constraints and maintenance procedures.

```sh
npm ci --ignore-scripts
npm test
npm run build
npm run check
```

Before releases and after host upgrades, verify dual-mode input, definition edits and Undo/Redo, copy buttons, adjacent quotes and tab isolation. Install the same verified assets in test and user vaults. [Maintenance and verification](docs/maintenance.md) covers packaging, acceptance, upgrades and rollback. [CHANGELOG](CHANGELOG.md) records released behavior.

## License

MIT. See [LICENSE](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md).
