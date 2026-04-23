# Changelog

All notable user-facing changes to the Huladyne site are documented in this file.

Versions follow [Semantic Versioning](https://semver.org/). The site ships from `main` via Vercel; each release is tagged `vX.Y.Z`.

## v3.15.9 — 2026-04-23

### Gamelab
- **Cascade v2.7.7** — full-year optimals regenerated (1095 entries, 2026-04-22 → 2027-04-21) under the new branch-and-bound solver. This is the follow-up rerun promised in v3.15.8. 8 Hard entries remain flagged truncated and will be chased at a higher search budget in a future release.
- **Cascade v2.7.8** — Easy puzzles are more varied. The generator was rewritten to stop flat-plateau dominance on small grids (elevRange 5 → 7, plateau seeding now scales with grid size, so 5×5 Easy gets 0–1 tiny plateaus instead of covering the board). All 366 Easy manifest entries regenerated. Also includes a +6-cell Hard improvement for 2026-05-01 (30 → 36) and 4 newly-proven Hard optima from the retry pass.

## v3.15.8 — 2026-04-22

### Gamelab
- **Cascade v2.7.6** — new longest-path solver (branch-and-bound with flood-fill upper-bound pruning) replaces the old iteration-capped DFS. Fixes plateau-heavy Hard puzzles where players could find paths longer than the stored "optimal" value, which made share text show nonsensical "X/Y cells" with X > Y.
  - 2026-04-22 Hard: 32 → 38 cells (proven optimum)
  - 2026-04-24 Hard: 30 → 32 cells (proven optimum)
  - Remaining 1089 manifest entries unchanged; full-year rerun in progress and will ship in a follow-up.

### Tooling
- Added `.claude/release-project-type` so `/release` skips the project-type prompt on future runs (treats Huladyne as static/web — skip build/test, tag and deploy via Vercel).
