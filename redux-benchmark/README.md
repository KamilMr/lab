# redux-benchmark

Minimal lab for building intuition about Reselect / `createSelector` memoization.
Mirrors patterns found in real-world React/Redux codebases.

## Run

```bash
npm install
npm start                     # run all scenarios
npm run scenario:factory      # 01 — the selectPositionDetails anti-pattern
npm run scenario:shared       # 02 — shared module-level memo (selectFormations)
npm run scenario:reference    # 03 — cross-dependency invalidation
npm run scenario:parameterized# 04 — cache size 1 vs LRU
npm run scenario:expensive    # 05 — timed comparison: memo vs plain
```

## What each scenario teaches

| # | File | Concept |
|---|---|---|
| 1 | `01-factory-antipattern.js` | Selector factories create new caches every call — memoization is dead. Shows 3 fix patterns. |
| 2 | `02-shared-memo.js` | One module-level `createSelector` = one shared cache across N consumers. Unrelated state changes are free. |
| 3 | `03-reference-identity.js` | Two selectors with overlapping inputs invalidate together. Lesson: every input dep is an invalidation trigger. |
| 4 | `04-parameterized.js` | Default cache size is 1 → thrashes on alternating args. `lruMemoize` with `maxSize` fixes it. |
| 5 | `05-expensive-compute.js` | Real `performance.now()` timing: memo wins ∝ (cache hit rate) × (compute cost). When inputs thrash, memo is overhead. |

## Key API for inspection

- `selector.recomputations()` — how many times the output function actually ran. **This is the number you watch.**
- `selector.resetRecomputations()` — reset the counter.
- `selector.dependencies` — the input selectors (for debugging).
- `selector.memoizedResultFunc` — the memoized transform itself.

## Mental model in 3 lines

1. `createSelector` caches the output of the last call based on **reference equality** of its input-selector results.
2. If any input returns a different reference, the output function re-runs.
3. Cache size is 1 by default. One consumer or many — doesn't matter. Same cache.
