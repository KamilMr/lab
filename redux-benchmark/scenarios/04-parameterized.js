import {
  createSelector,
  createSelectorCreator,
  lruMemoize,
  weakMapMemoize,
} from 'reselect';
import {makeStore} from '../store.js';

/**
 * SCENARIO 4 — Parameterized selectors: memoize strategy matters
 *
 * Reselect v4 default: defaultMemoize — cache size 1 (thrashes on alternating args).
 * Reselect v5 default: weakMapMemoize — multi-key cache keyed by object identity.
 *
 * This scenario shows: the legacy size-1 behavior, the v5 default, and explicit LRU.
 */

// Force legacy cache-size-1 behavior (what Reselect v4 did by default)
const createSize1Selector = createSelectorCreator(lruMemoize, {maxSize: 1});
const selectByKey_size1 = createSize1Selector(
  [state => state.main.positionDetailsLookup, (_, key) => key],
  (lookup, key) => lookup[`key-${key.id}`],
);

// Reselect v5 default — weakMapMemoize (multi-key)
const selectByKey_v5default = createSelector(
  [state => state.main.positionDetailsLookup, (_, key) => key],
  (lookup, key) => lookup[`key-${key.id}`],
  {memoize: weakMapMemoize},
);

// Explicit LRU with maxSize: 10
const createLruSelector = createSelectorCreator(lruMemoize, {maxSize: 10});
const selectByKey_lru = createLruSelector(
  [state => state.main.positionDetailsLookup, (_, key) => key],
  (lookup, key) => lookup[`key-${key.id}`],
);

const store = makeStore();
const state = store.getState();

console.log('\n=== SCENARIO 4: Parameterized selectors & cache strategy ===\n');

// Fresh object identities each call — mimics `selectPositionDetails({lat, lon})`
// being called in render. The VALUES repeat but the references don't.
const makeKeys = () => [
  {id: 1},
  {id: 2},
  {id: 3},
  {id: 1},
  {id: 2},
  {id: 3},
];
const keys = makeKeys();

console.log('Params are fresh object references every call (id values repeat):\n');
console.log('Legacy cache-size-1 (Reselect v4 default) — thrashes:');
keys.forEach((k, i) => {
  selectByKey_size1(state, k);
  console.log(
    `  call ${i + 1} id=${k.id}: recomputations=${selectByKey_size1.recomputations()}`,
  );
});

console.log('\nReselect v5 default (weakMapMemoize) — multi-key cache:');
keys.forEach((k, i) => {
  selectByKey_v5default(state, k);
  console.log(
    `  call ${i + 1} id=${k.id}: recomputations=${selectByKey_v5default.recomputations()}`,
  );
});

console.log('\nExplicit LRU (maxSize: 10) — multi-key with bounded memory:');
keys.forEach((k, i) => {
  selectByKey_lru(state, k);
  console.log(
    `  call ${i + 1} id=${k.id}: recomputations=${selectByKey_lru.recomputations()}`,
  );
});

// The real fix: stable references. Reuse the SAME object per logical key.
const stable = {1: {id: 1}, 2: {id: 2}, 3: {id: 3}};
const stableKeys = [stable[1], stable[2], stable[3], stable[1], stable[2], stable[3]];

selectByKey_v5default.resetRecomputations();
selectByKey_lru.resetRecomputations();

console.log('\n--- FIX: pass STABLE references (same object reused) ---\n');

console.log('v5 default (weakMapMemoize) with stable refs — cache hits on revisit:');
stableKeys.forEach((k, i) => {
  selectByKey_v5default(state, k);
  console.log(
    `  call ${i + 1} id=${k.id}: recomputations=${selectByKey_v5default.recomputations()}`,
  );
});

console.log('\nLRU with stable refs — same result:');
stableKeys.forEach((k, i) => {
  selectByKey_lru(state, k);
  console.log(
    `  call ${i + 1} id=${k.id}: recomputations=${selectByKey_lru.recomputations()}`,
  );
});

console.log('\nLesson: memoization strategies only help if the PARAMS are reference-stable.');
console.log('In React: wrap the param in useMemo, OR pass primitives (id) instead of objects.');
console.log('Example: selectPositionDetails({lat, lon}) creates fresh {lat, lon}');
console.log('every render → every memoize strategy thrashes. Fix: pass `key-${lat}-${lon}`.\n');
