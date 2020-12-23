export const filterObject = (obj: { [key: string]: any }, predicate: (_: any) => boolean) =>
  Object.keys(obj)
    .filter((key) => predicate(obj[key]))
    .reduce((res, key) => ((res[key] = obj[key]), res), {} as { [key: string]: any });

function compose(...funcs: any[]) {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any) => a(b(...args)));
}

/**
 * call like: applyMiddleware(middleware1, middleware2)(useReducer)(...useReducerArgs)
 * @param  {...any} middlewares
 */
export function applyMiddleware(...middlewares: any[]) {
  return (
    useReducer: (arg0: any, arg1: any, arg2: any) => readonly [any, (action: unknown) => void]
  ) => (reducer: any, preloadedState: any, initState: any) => {
    const [store, storeDispatch] = useReducer(reducer, preloadedState, initState);

    let dispatch = (action: any, ...args: any[]) => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      );
    };

    const middlewareAPI = {
      getState: () => store,
      dispatch: (action: any, ...args: any) => dispatch(action, ...args),
    };
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(storeDispatch);

    return [store, dispatch];
  };
}

/**
 * Example middleware from redux
 * @param {*} param0
 */
export function logger({ getState }: { getState: () => {} }) {
  return (next: (arg0: any) => any) => (action: any) => {
    console.log('state before dispatch', getState());
    console.log('will dispatch', action);

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action);

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  };
}

/**
 * Wrap all actions in the object with dispatch, to allow calling them from any context
 * @param {Function} dispatch
 * @param {Object} actions
 * @returns {Object} object with actions bound to dispatch
 */
export function bindActionCreatorsObject<T extends { [key: string]: Function }>(
  dispatch: (arg0: any) => any,
  actions: T
): T {
  return Object.entries(actions).reduce((actions, [name, action]) => {
    actions[name] = (...args: any) => dispatch(action(...args));
    return actions;
  }, {} as { [key: string]: Function }) as T;
}

/** Read event data first! */
export const debounce = (func: (arg0: any) => any, delay = 200) => {
  let timeout: number;
  return (event: any) => {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func(event), delay);
  };
};
