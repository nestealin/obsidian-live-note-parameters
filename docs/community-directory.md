# Community directory submission

Submitted and published on 2026-10-16 through the current official community portal.

- Public listing: https://community.obsidian.md/plugins/live-note-parameters
- Owner management: https://community.obsidian.md/account/plugins/live-note-parameters
- Repository: `nestealin/obsidian-live-note-parameters`.
- Current directory review: `0.1.0`, source `e58b74acc10df0f06ffb709735491dd25a0f156d`.
- Latest GitHub release: `0.1.1`, source `d119252cd1d3b873e02983557132a82fd8f8b512`.
- Observed on 2026-10-18: the 0.1.0 release review remains failed; the explicit `main` preview at `5064e35b732cf33edb715a02154b0e32d39de66f` completed, with a dependency pass and CSS warnings; public **Add to Obsidian** remains disabled.

Submission is complete; in-app availability still depends on directory review. A manual check for 0.1.1 reports that the directory could not read the default-branch manifest. Anonymous GitHub contents API and raw `HEAD`/`main` manifest requests all return HTTP 200 with the correct 0.1.1 file. An explicit `main` preview was accepted at the commit above, but the 0.1.1 release sync is not confirmed.

An authorized repair request was submitted through the official **Get help** form on 2026-10-16 and updated on 2026-10-18; the saved request remains **open**. It now explicitly requests administrator repository-identity verification and re-association for entry `12384`: the original GitHub repository ID was `1421770317`, and the recreated repository at the same URL is `1421866513`. The owner-facing listing editor does not expose a repository-association field. The request asks administrators to verify ownership, apply the identity override, resync 0.1.1, and rerun its release review. Entry-specific confirmation and the actual override remain pending.

Warnings do not block submissions under the [official review guidance](https://docs.obsidian.md/community-directory/manage-entry). No plugin-code change or new release is indicated by this default-branch read failure. Resolution requires successful detection and review of the 0.1.1 release, followed by an enabled public installation action. A completed branch preview alone is insufficient. Local main-vault and BRAT/manual installations remain usable.

Preflight confirmed that the manifest matches the default branch, the ID and name do not duplicate a published entry, the release tag matches the manifest version, all three plugin assets match the packaged bytes, and README/license files are present.

Machine-specific receipts and screenshots belong in ignored `run-data/community-submission/`. No credentials are recorded.

## References

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
