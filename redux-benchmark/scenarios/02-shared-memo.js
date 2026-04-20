import {createSelector} from 'reselect';
import {makeStore, bumpUnrelated, touchFormations} from '../store.js';

/**
 * SCENARIO 2 — Shared module-level memoization
 *
 * Mirrors `selectFormations`. One createSelector shared across N components
 * gives you ONE cache. Only input-reference changes invalidate it.
 */

const selectFormations = createSelector(
  [state => state.main.formations, state => state.main.ads],
  (formations, ads) => {
    return formations.map(f => ({...f, _adsCount: ads.length}));
  },
);

const store = makeStore();

console.log('\n=== SCENARIO 2: Shared memoized selector ===\n');

// 7 components all call selectFormations on mount
console.log('7 components read selectFormations (same state):');
for (let i = 0; i < 7; i++) {
  selectFormations(store.getState());
}
console.log(
  `  recomputations=${selectFormations.recomputations()} (computed once, 6 cache hits)`,
);

console.log('\nDispatch unrelated action (state.main.unrelated changes):');
store.dispatch(bumpUnrelated());
selectFormations(store.getState());
console.log(
  `  recomputations=${selectFormations.recomputations()} (still 1 — input refs unchanged)`,
);

console.log('\nDispatch touchFormations (formations reference replaced):');
store.dispatch(touchFormations());
selectFormations(store.getState());
console.log(
  `  recomputations=${selectFormations.recomputations()} (now 2 — input invalidated)`,
);

console.log(
  '\nLesson: memoization is driven by REFERENCE IDENTITY of input selectors.',
);
console.log(
  'Unrelated state changes are free. Any write that replaces the input ref pays full cost.\n',
);
