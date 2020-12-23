import { produce } from 'immer';
import { fetchInitialData, postOrder, tableSorter } from './services';
import { Filters } from './filters';

// Actions
const RESET_ORDER = 'RESET_ORDER';
const SET_DRINKS = 'SET_DRINKS';
const SET_ORDER_TABLE = 'SET_ORDER_TABLE';
const SET_ORDER_LOCKED = 'SET_ORDER_LOCKED';
const SET_INITIAL_DATA = 'SET_INITIAL_DATA';
const ADD_TABLE_TO_STATE = 'ADD_TABLE_TO_STATE';
const TOGGLE_TAG = 'TOGGLE_TAG';
const TOGGLE_FILTER = 'TOGGLE_FILTER';
const RESET_FILTERS = 'RESET_FILTERS';
const SET_CATEGORIES = 'SET_CATEGORIES';
const INCREMENT_ORDER_ITEM = 'INCREMENT_ORDER_ITEM';
const DECREMENT_ORDER_ITEM = 'DECREMENT_ORDER_ITEM';
const SET_HIDE_ORDER_HINTER = 'SET_HIDE_ORDER_HINTER';

export const Actions = {
  // Action Creators
  resetOrder: () => ({ type: RESET_ORDER }),

  setDrinks: (drinks: { [key: string]: Drink }) => ({ type: SET_DRINKS, payload: drinks }),

  setOrderLocked: (locked: boolean) => ({ type: SET_ORDER_LOCKED, payload: locked }),

  setOrderTable: (table: string) => ({ type: SET_ORDER_TABLE, payload: table }),

  setCategories: (categories: Category[]) => ({
    type: SET_CATEGORIES,
    payload: { categories },
  }),

  toggleTag: (id: number) => ({ type: TOGGLE_TAG, payload: id }),

  toggleFilter: (id: string) => ({ type: TOGGLE_FILTER, payload: id }),

  resetFilters: () => ({ type: RESET_FILTERS }),

  setInitialData: ({
    drinks,
    categories,
    tags,
    tables,
  }: {
    drinks: { [key: string]: Drink };
    categories: Category[];
    tags: Tag[];
    tables: Table[];
  }) => ({
    type: SET_INITIAL_DATA,
    payload: { drinks, categories, tags, tables },
  }),

  addTableToState: (tableName: string) => ({ type: ADD_TABLE_TO_STATE, payload: tableName }),

  incrementOrderItem: (id: number) => ({ type: INCREMENT_ORDER_ITEM, payload: { id } }),

  decrementOrderItem: (id: number) => ({ type: DECREMENT_ORDER_ITEM, payload: { id } }),

  setHideOrderHinter: (hide: boolean) => ({
    type: SET_HIDE_ORDER_HINTER,
    payload: hide,
  }),

  // Thunks
  loadInitialDataIntoState: () => async (
    dispatch: (arg0: { type: string; payload: InitialData }) => void
  ) => {
    const { drinks, categories, tags, tables } = await fetchInitialData();
    dispatch(Actions.setInitialData({ drinks, categories, tags, tables }));
  },

  sendOrder: () => (
    dispatch: (arg0: { type: string; payload?: any }) => void,
    getState: () => { (): any; new (): any; order: Order }
  ) => {
    dispatch(Actions.setOrderLocked(true));
    postOrder(getState().order)
      .then((response) => {
        console.log('response:', response);
        dispatch(Actions.resetOrder());
        dispatch(Actions.addTableToState(response.table));
      })
      .catch((error) => console.error(error))
      .finally(() => dispatch(Actions.setOrderLocked(false)));
  },
};

// Init function
export function initState(): State {
  return {
    drinks: {},
    categories: [],
    tags: [],
    tables: [],
    filters: Filters,
    order: {
      locked: false,
      table: '',
      items: [],
      hideHinter: false,
    },
  };
}

// Reducer logic
const ReducerHandlers = {
  [SET_DRINKS]: (state: State, payload: { [key: string]: Drink }) => {
    state.drinks = payload;
  },

  [SET_ORDER_LOCKED]: (state: State, payload: boolean) => {
    state.order.locked = payload;
  },

  [SET_ORDER_TABLE]: (state: State, payload: string) => {
    state.order.table = payload;
  },

  [RESET_ORDER]: (state: State) => {
    state.order.items = [];
  },

  [SET_INITIAL_DATA]: (state: State, payload: InitialData) => {
    state.drinks = payload.drinks;
    state.categories = payload.categories;
    state.tags = payload.tags;
    state.tables = payload.tables;
  },

  [ADD_TABLE_TO_STATE]: (state: State, payload: string) => {
    state.tables.push({ name: payload });
    state.tables.sort(tableSorter);
  },

  [TOGGLE_TAG]: (state: State, payload: number) => {
    const index = state.tags.findIndex((tag: { id: any }) => tag.id === payload);
    state.tags[index].exclude = !state.tags[index].exclude;
  },

  [TOGGLE_FILTER]: (state: State, payload: string) => {
    const index = state.filters.findIndex((filter: Filter) => filter.id === payload);
    state.filters[index].active = !state.filters[index].active;
    // set all filters listed in exclusive array to false
    state.filters[index].exclusive.forEach((exclusiveId: string) => {
      const exIndex = state.filters.findIndex((filter: Filter) => filter.id === exclusiveId);
      state.filters[exIndex].active = false;
    });

    const allFilter = state.filters.find((filter: Filter) => filter.id === 'ALL');
    allFilter.active = !state.filters.some((filter) => filter.active);
  },

  [RESET_FILTERS]: (state: State) => {
    state.filters = Filters;
  },

  [INCREMENT_ORDER_ITEM]: (state: State, payload: { id: number }) => {
    const items = state.order.items;
    const index = items.findIndex((item: { id: number }) => item.id === payload.id);
    if (index > -1) {
      items[index].count++;
    } else {
      items.push({ id: payload.id, count: 1 });
    }
  },

  [DECREMENT_ORDER_ITEM]: (state: State, payload: { id: number }) => {
    const items = state.order.items;
    const index = items.findIndex((item: { id: number }) => item.id === payload.id);
    if (items[index].count > 1) {
      items[index].count--;
    } else {
      items.splice(index, 1);
    }
  },

  [SET_HIDE_ORDER_HINTER]: (state: State, payload: boolean) => {
    state.order.hideHinter = payload;
  },
};

// Reducer
export const reducer = produce(
  (state: State, action: { type: keyof typeof ReducerHandlers; payload: any }) => {
    const handler: (state: State, payload: any) => void = ReducerHandlers[action.type];
    if (handler) {
      return handler(state, action.payload);
    }

    return state;
  }
);
