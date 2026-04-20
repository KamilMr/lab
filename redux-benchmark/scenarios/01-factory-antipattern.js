import {createSelector} from 'reselect';
import {makeStore, bumpUnrelated} from '../store.js';

/**
 * SCENARIO 1 — The selector-factory anti-pattern
 *
 * Mirrors `selectPositionDetails` in mainSlice.js:574.
 * Each call to the factory returns a BRAND NEW createSelector instance
 * with an empty cache → memoization is effectively dead.
 */

const selectPositionDetails_BROKEN = pos =>
  createSelector(
    [state => state.main.positionDetailsLookup],
    lookup => {
      return lookup[pos];
    },
  );

// Fix #1: simple non-memoized selector (memo adds no value here)
const selectPositionDetails_FIXED_SIMPLE = pos => state =>
  state.main.positionDetailsLookup[pos];

// Fix #2: hoisted parameterized selector (one shared cache, size 1)
const selectPositionDetails_FIXED_PARAM = createSelector(
  [state => state.main.positionDetailsLookup, (_, pos) => pos],
  (lookup, pos) => lookup[pos],
);

const store = makeStore();

console.log('\n=== SCENARIO 1: Selector factory anti-pattern ===\n');

// Simulate 5 "renders" — component calls useSelector(factory('key-1')) each render
console.log('BROKEN factory — creates new selector every call:');
for (let i = 0; i < 5; i++) {
  const sel = selectPositionDetails_BROKEN('key-1');
  sel(store.getState());
  console.log(
    `  render ${i + 1}: recomputations=${sel.recomputations()} (always 1, cache is fresh)`,
  );
}

console.log('\nFIXED (hoisted parameterized) — one selector, one cache:');
for (let i = 0; i < 5; i++) {
  selectPositionDetails_FIXED_PARAM(store.getState(), 'key-1');
  console.log(
    `  render ${i + 1}: recomputations=${selectPositionDetails_FIXED_PARAM.recomputations()} (stays at 1)`,
  );
}

console.log('\nFIXED + param changes — cache size 1 invalidates on new key:');
['key-1', 'key-1', 'key-2', 'key-2', 'key-1'].forEach((k, i) => {
  selectPositionDetails_FIXED_PARAM(store.getState(), k);
  console.log(
    `  call ${i + 1} key=${k}: recomputations=${selectPositionDetails_FIXED_PARAM.recomputations()}`,
  );
});

console.log(
  '\nLesson: cache-size-1 selectors thrash when called with alternating args.',
);
console.log('For multi-key access use re-reselect or memoize per-key.\n');
