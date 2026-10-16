# Maintenance

## Source and versions

`package.json` owns the product version. `manifest.json`, `versions.json` and the changelog must agree. The plugin ID is permanently `live-note-parameters`; temporary values are never migrated or persisted.

The repository is the only editable source. Vault plugin folders receive only `main.js`, `manifest.json` and `styles.css`. Do not edit installed bundles or copy `data.json` from another vault.

## Acceptance

Run core tests, build and syntax checks. Then install the candidate in a separate test vault with Copy Inline Code 2.1.0 and copy `examples/live-note-parameters.md` to `zz-live-note-parameters-mvp.md`.

On macOS, with the official Obsidian CLI enabled:

```sh
python3 scripts/verify-runtime.py --vault-path /path/to/test-vault --vault TestVault
python3 scripts/verify-manager.py --vault-path /path/to/test-vault --vault TestVault
python3 scripts/verify-width.py --vault-path /path/to/test-vault --vault TestVault
python3 scripts/verify-focus.py --vault-path /path/to/test-vault --vault TestVault
```

These probes create and close only their own tabs, restore the previous active tab, use synthetic clipboard content, and write receipts to gitignored `evidence/`. The manager probe restores the dedicated synthetic fixture through its own editor. Do not point them at business notes. Focus emulation is disabled in cleanup.

After Obsidian, theme or copy-plugin upgrades, verify dual-mode editing, default changes, rename/delete/cancel/conflicts, Undo/Redo, empty/CJK/long values, adjacent quotes, block/inline copy, multiple tabs, mode switching, reload/unload and unchanged source bytes. A physical IME check is separate from CDP text insertion.

## Release

1. Complete acceptance and update version/changelog. Commit only project files.
2. Freeze source with an annotated deployment tag `live-note-parameters-vYYYY.MM.DD.N`.
3. Build once and run `node scripts/package.mjs`; `dist/<version>/` contains immutable assets and SHA256SUMS. Repackaging refuses changed assets at an existing version.
4. Create the annotated product tag exactly matching `manifest.version`, such as `0.1.0`, for Obsidian updater compatibility. Publish the release with the three plugin files and checksums.
5. Install the same packaged bytes in test and user vaults using `scripts/install.py`; refresh manifests and enable/reload the plugin through Obsidian.
6. Record source SHA, tags, asset hashes, environment and accepted/rejected result in a release record. Verify remote refs and downloaded asset hashes.

## Troubleshooting and rollback

If fields remain raw, check `doc_vars`, string values, duplicate definitions, eligible fences and source mode. Definition errors appear in the Live Preview manager. Missing definitions prevent the adapted copy action from reporting success.

If an upgrade fails, disable Live Note Parameters. Markdown remains readable and other copy plugins continue to operate. Reinstall the three assets from the previous accepted Release and reload the plugin. Definition edits can be undone through normal editor history; the plugin does not keep hidden note backups.

Install receipts and code-asset backups belong in this project's gitignored `run-data/`. They contain no plugin settings. They are recovery evidence, not a second source checkout.
