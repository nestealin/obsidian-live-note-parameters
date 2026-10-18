# Community directory submission

Submitted and published on 2026-10-16 through the current official community portal.

- Public listing: https://community.obsidian.md/plugins/live-note-parameters
- Owner management: https://community.obsidian.md/account/plugins/live-note-parameters
- Repository: `nestealin/obsidian-live-note-parameters`.
- Current directory release and completed review: `0.1.1`, source `d119252cd1d3b873e02983557132a82fd8f8b512`.
- Latest GitHub release: `0.1.1`, source `d119252cd1d3b873e02983557132a82fd8f8b512`.
- Verified on 2026-10-19: release review **Completed**, help request **resolved**, public **Add to Obsidian** enabled, and the listing reports version **0.1.1** with review status **Satisfactory**.

The release-discovery blocker is resolved. The public installation action now links to `obsidian://show-plugin?id=live-note-parameters`. Users can open the plugin in Obsidian from the listing; BRAT and manual installation remain available.

The completed release review confirms that the build reproduces the released `main.js` byte-for-byte, finds no vulnerable dependencies or suspicious network patterns, and passes individual vault-file access checks. Remaining findings are non-blocking CSS warnings and recommendations about artifact attestations, extra checksum/provenance assets, and clipboard access.

The support request for repository-identity verification and re-association is marked **resolved**. The recreated repository retains the same URL and plugin ID; no additional plugin-code change or version increment was needed to clear this publishing blocker. Local installations were not changed by this status verification.

Preflight confirmed that the manifest matches the default branch, the ID and name do not duplicate a published entry, the release tag matches the manifest version, all three plugin assets match the packaged bytes, and README/license files are present.

Machine-specific receipts and screenshots belong in ignored `run-data/community-submission/`. No credentials are recorded.

## References

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
