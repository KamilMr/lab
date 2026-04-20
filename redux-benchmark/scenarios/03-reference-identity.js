import {createSelector} from 'reselect';
import {makeStore, touchAds, touchFormations} from '../store.js';

/**
 * SCENARIO 3 — Cross-dependency invalidation
 *
 * Mirrors the selectAds ↔ selectFormations relationship in mainSlice.
 * Both selectors depend on BOTH formations and ads. Any write to either
 * slice invalidates BOTH selectors. Components using both pay 2x.
 */

const selectAds = createSelector(
  [state => state.main.ads, state => state.main.formations],
  (ads, formations) => ads.map(a => ({...a, formationCount: formations.length})),
);

const selectFormations = createSelector(
  [state => state.main.formations, state => state.main.ads],
  (formations, ads) => formations.map(f => ({...f, adsCount: ads.length})),
);

const store = makeStore();

console.log('\n=== SCENARIO 3: Cross-dependency invalidation ===\n');

selectAds(store.getState());
selectFormations(store.getState());
console.log('Initial: both selectors computed once');
console.log(`  selectAds=${selectAds.recomputations()}`);
console.log(`  selectFormations=${selectFormations.recomputations()}`);

console.log('\nDispatch touchAds (only ads ref changes):');
store.dispatch(touchAds());
selectAds(store.getState());
selectFormations(store.getState());
console.log(`  selectAds=${selectAds.recomputations()} (recomputed, expected)`);
console.log(
  `  selectFormations=${selectFormations.recomputations()} (recomputed too! because it depends on ads)`,
);

console.log('\nDispatch touchFormations:');
store.dispatch(touchFormations());
selectAds(store.getState());
selectFormations(store.getState());
console.log(`  selectAds=${selectAds.recomputations()} (recomputed, depends on formations)`);
console.log(`  selectFormations=${selectFormations.recomputations()}`);

console.log('\nLesson: every input dependency is a reason to invalidate.');
console.log('If two selectors mutually depend on each other\'s raw inputs,');
console.log('any write triggers both. Split inputs or merge into one selector.\n');
