import {configureStore, createSlice} from '@reduxjs/toolkit';

// Seed: 500 formations, 200 ADS, a position lookup table
const seedFormations = Array.from({length: 500}, (_, i) => ({
  id: i,
  name: `F-${i}`,
  activeFaults: [],
  flightVolume: [],
}));

const seedAds = Array.from({length: 200}, (_, i) => ({
  id: i,
  formation: {id: i % 500},
  coords: {lat: 50 + i * 0.01, lon: 20 + i * 0.01},
}));

const seedLookup = Object.fromEntries(
  Array.from({length: 100}, (_, i) => [
    `key-${i}`,
    {w3w: `word-${i}`, lat: 50 + i, lon: 20 + i, extra: `data-${i}`},
  ]),
);

const mainSlice = createSlice({
  name: 'main',
  initialState: {
    formations: seedFormations,
    ads: seedAds,
    positionDetailsLookup: seedLookup,
    unrelated: 0, // used to test invalidation from unrelated changes
  },
  reducers: {
    touchFormations: state => {
      // Immer: creates a new reference for formations
      state.formations = [...state.formations];
    },
    touchAds: state => {
      state.ads = [...state.ads];
    },
    addFormation: (state, action) => {
      state.formations.push(action.payload);
    },
    bumpUnrelated: state => {
      state.unrelated += 1;
    },
  },
});

export const {touchFormations, touchAds, addFormation, bumpUnrelated} =
  mainSlice.actions;

export const makeStore = () =>
  configureStore({reducer: {main: mainSlice.reducer}});
