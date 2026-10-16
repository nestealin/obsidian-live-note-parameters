# Demo media maintenance

These images show the real desktop plugin in macOS / Obsidian 1.13.7 using only synthetic note content. Captured on 2026-10-16 with the installed 0.1.0 runtime; the 0.1.1 JavaScript and stylesheet are byte-identical. Manager labels are currently Chinese, as shown in the actual UI.

| Asset | What it demonstrates |
| --- | --- |
| `live-sync.gif` | A loop of three Live Preview states: defaults, project changed to `atlas-staging`, region changed to `europe-west1`. Captured states are held for readability; this is not a continuous screen recording. |
| `live-preview.png` | The final Live Preview state, with the fixed example unchanged. |
| `reading-mode.png` | The same tab in Reading with its temporary values retained. |
| `parameter-manager.png` | The default-value manager, with reference counts and save/cancel controls. |

## Refresh the media

1. Use a separate test vault and the complete note in `examples/cloud-runbook.md`. Show only synthetic content and keep unrelated notes, tab titles and sidebars outside the capture.
2. In Live Preview, capture defaults, then edit `PROJECT_ID` inside a command block to `atlas-staging`, then `REGION` in the other block to `europe-west1`. Keep the same content rectangle across all three frames. Verify prose and both commands match, adjacent quotes remain visible, and the fixed example stays literal.
3. Expand the parameter manager and capture the real panel. Its saved defaults remain `demo-project` / `us-central1` while the tab uses temporary values.
4. Switch the same tab to Reading and capture the retained values. Use the existing host acceptance probes for copy semantics; media capture does not require reading or overwriting a user's clipboard.
5. Assemble the three unaltered states into a small looping GIF; resize proportionally and retain static PNG alternatives. Check every frame, text legibility at README width, and both README language entry points on GitHub.
6. Keep these assets and the example sources in the repository. Record local capture receipts in ignored `run-data/`; do not include local paths, private note names or machine state in public media.

Update both READMEs and both walkthroughs when examples change. Demonstrations must describe released behavior; documentation-only updates do not require a product version bump.
