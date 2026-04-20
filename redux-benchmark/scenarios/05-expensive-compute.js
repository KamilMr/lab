import {createSelector} from 'reselect';
import {performance} from 'node:perf_hooks';
import {makeStore, bumpUnrelated, touchFormations} from '../store.js';

/**
 * SCENARIO 5 — Measuring real cost
 *
 * Compares memoized vs unmemoized selectors doing "expensive" work
 * (simulating Turf geometry / selectFormations).
 */

const expensiveTransform = formations =>
  formations.map(f => {
    // simulate ~O(n) work per formation — like buildRectFlightVolume
    let acc = 0;
    for (let i = 0; i < 500; i++) acc += Math.sqrt(f.id * i);
    return {...f, _computed: acc};
  });

const selectFormations_memo = createSelector(
  [state => state.main.formations],
  expensiveTransform,
);

const selectFormations_plain = state =>
  expensiveTransform(state.main.formations);

const store = makeStore();

console.log('\n=== SCENARIO 5: Measuring real cost ===\n');

const RUNS = 1000;

// Warm up
selectFormations_memo(store.getState());
selectFormations_plain(store.getState());

const t1 = performance.now();
for (let i = 0; i < RUNS; i++) selectFormations_memo(store.getState());
const memoTime = performance.now() - t1;

const t2 = performance.now();
for (let i = 0; i < RUNS; i++) selectFormations_plain(store.getState());
const plainTime = performance.now() - t2;

console.log(
  `${RUNS} calls, state UNCHANGED:`,
);
console.log(`  memoized: ${memoTime.toFixed(2)} ms (${selectFormations_memo.recomputations()} recomputations)`);
console.log(`  plain:    ${plainTime.toFixed(2)} ms (recomputes every call)`);
console.log(`  speedup:  ${(plainTime / memoTime).toFixed(1)}x\n`);

// Now invalidate every call
const t3 = performance.now();
for (let i = 0; i < RUNS; i++) {
  store.dispatch(touchFormations());
  selectFormations_memo(store.getState());
}
const memoInvalidatedTime = performance.now() - t3;

console.log(`${RUNS} calls, state MUTATED each call:`);
console.log(`  memoized: ${memoInvalidatedTime.toFixed(2)} ms (${selectFormations_memo.recomputations()} recomputations)`);
console.log(`  → memoization buys you nothing when inputs thrash.`);
console.log(`  → plus a small overhead per call for the equality check.\n`);

console.log('Lesson: memo wins proportionally to (cache hit rate) × (compute cost).');
console.log('Profile before optimizing: if inputs invalidate constantly, memo is dead weight.\n');
