# Community directory submission

Submitted and published on 2026-10-16 through the current official community portal.

- Public listing: https://community.obsidian.md/plugins/live-note-parameters
- Owner management: https://community.obsidian.md/account/plugins/live-note-parameters
- Repository: `nestealin/obsidian-live-note-parameters`.
- Current directory review: `0.1.0`, source `e58b74acc10df0f06ffb709735491dd25a0f156d`.
- Latest GitHub release: `0.1.1`, source `d119252cd1d3b873e02983557132a82fd8f8b512`.
- Observed status: the 0.1.0 review failed; an explicit `main` preview at `5064e35b732cf33edb715a02154b0e32d39de66f` is pending; public **Add to Obsidian** button disabled.

Submission is complete; in-app availability still depends on directory review. A manual check for 0.1.1 reports that the directory could not read the default-branch manifest. Anonymous GitHub contents API and raw `HEAD`/`main` manifest requests all return HTTP 200 with the correct 0.1.1 file. An explicit `main` preview was accepted at the commit above, but the 0.1.1 release sync is not confirmed.

An authorized repair request was submitted through the official **Get help** form and acknowledged as **open** on 2026-10-16. It asks administrators to verify the repository association and default-branch lookup, then retry detecting 0.1.1. The exact cause is unconfirmed pending server-side investigation. Check the management page for the response and review results, then verify installation availability on the public listing. A live listing and an accepted preview request are separate from an accepted release. Local main-vault and BRAT/manual installations remain usable.

Preflight confirmed that the manifest matches the default branch, the ID and name do not duplicate a published entry, the release tag matches the manifest version, all three plugin assets match the packaged bytes, and README/license files are present.

Machine-specific receipts and screenshots belong in ignored `run-data/community-submission/`. No credentials are recorded.

## References

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
