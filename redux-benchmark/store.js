import {configureStore, createSlice} from '@reduxjs/toolkit';

const initialState = {
  // primitives
  counter: 0,
  message: 'hello',
  flag: false,

  // collections
  list: [1, 2, 3],
  tags: ['a', 'b'],
  user: {name: 'Kamil', age: 30},
  settings: {theme: 'dark', lang: 'en'},
};

const mainSlice = createSlice({
  name: 'main',
  initialState,
  reducers: {
    // --- number ---
    numberAdd: (state, action) => {
      state.counter += action.payload;
    },
    numberSubtract: (state, action) => {
      state.counter -= action.payload;
    },
    numberSet: (state, action) => {
      state.counter = action.payload;
    },
    numberReset: state => {
      state.counter = 0;
    },

    // --- string ---
    stringSet: (state, action) => {
      state.message = action.payload;
    },
    stringAppend: (state, action) => {
      state.message += action.payload;
    },
    stringClear: state => {
      state.message = '';
    },

    // --- boolean ---
    booleanToggle: state => {
      state.flag = !state.flag;
    },
    booleanSet: (state, action) => {
      state.flag = action.payload;
    },

    // --- array ---
    arrayPush: (state, action) => {
      state.list.push(action.payload);
    },
    arrayPop: state => {
      state.list.pop();
    },
    arrayRemoveByIndex: (state, action) => {
      state.list.splice(action.payload, 1);
    },
    arrayReplace: (state, action) => {
      state.list = action.payload;
    },
    arrayClear: state => {
      state.list = [];
    },
    arrayUpdateItem: (state, action) => {
      const {index, value} = action.payload;
      state.list[index] = value;
    },

    // --- object ---
    objectUpdate: (state, action) => {
      // merge patch into user
      Object.assign(state.user, action.payload);
    },
    objectSetField: (state, action) => {
      const {key, value} = action.payload;
      state.user[key] = value;
    },
    objectReplace: (state, action) => {
      state.user = action.payload;
    },
    objectDeleteField: (state, action) => {
      delete state.user[action.payload];
    },

    // --- settings (second object, to compare unrelated updates) ---
    settingsUpdate: (state, action) => {
      Object.assign(state.settings, action.payload);
    },
  },
});

export const {
  numberAdd,
  numberSubtract,
  numberSet,
  numberReset,
  stringSet,
  stringAppend,
  stringClear,
  booleanToggle,
  booleanSet,
  arrayPush,
  arrayPop,
  arrayRemoveByIndex,
  arrayReplace,
  arrayClear,
  arrayUpdateItem,
  objectUpdate,
  objectSetField,
  objectReplace,
  objectDeleteField,
  settingsUpdate,
} = mainSlice.actions;

export const makeStore = () =>
  configureStore({reducer: {main: mainSlice.reducer}});
