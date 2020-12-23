import { html } from 'lit-html';
import { component, useEffect, useReducer } from 'haunted';
import thunk from 'redux-thunk';

import { applyMiddleware, logger, bindActionCreatorsObject, filterObject } from '../util/utils';
import { initState, reducer, Actions } from '../business/reducer';
import { createTapper, Patterns } from '../util/tapper';

function App() {
  // do you even curry?
  const [state, dispatch] = applyMiddleware(thunk, logger)(useReducer)(reducer, null, initState);

  // bind actions to dispatch
  const BoundActions = bindActionCreatorsObject(dispatch, Actions);

  useEffect(() => {
    BoundActions.loadInitialDataIntoState();
    const destinationFromUri = new URLSearchParams(window.location.search).get('destination');
    if (destinationFromUri) {
      BoundActions.setOrderTable(destinationFromUri);
    }
  }, []);

  // add listener for the secret tapper, depending on availability of touch/mousedown events
  useEffect(() => {
    const listener = document.ontouchstart ? 'touchstart' : 'mousedown';
    const tapper = createTapper({ pattern: Patterns.wedding, tolerance: 0.9 }, () => {
      document.getElementById('fireworks-container').style.display = 'block';
    });
    const titleElement = document.getElementById('title');
    titleElement.addEventListener(listener, tapper);
    return () => titleElement.removeEventListener(listener, tapper);
  }, [state]);

  const fireworks = () => {
    return html`
      <div
        id="fireworks-container"
        class="fireworks-container"
        @click=${(e: { target: HTMLElement }) => {
          e.target.style.display = 'none';
        }}
      >
        <div class="pyro">
          <div class="before"></div>
          <div class="after"></div>
        </div>
      </div>
    `;
  };

  const flexHideClasses = !state.order.items.length
    ? 'flex-hide'
    : state.order.items.length > 2
    ? 'flex-overflow-unhide'
    : '';

  return html`
    ${fireworks()}
    <cart-hinter
      .orderListLength=${state.order.items.length}
      .hideOrderHinter="${state.order.hideHinter}"
      .setHideOrderHinter=${BoundActions.setHideOrderHinter}
    ></cart-hinter>
    <main>
      <header class="header">
        <h1 id="title" class="title">J&A</h1>
      </header>
      <section class="hero">
        <h1>Getränkekarte</h1>
      </section>
      <div class="flex-container wrapper">
        <section class="menue">
          <drink-filter-bar
            .filters=${state.filters}
            .toggleFilter=${BoundActions.toggleFilter}
            .resetFilters=${BoundActions.resetFilters}
          ></drink-filter-bar>
          <drink-menue
            .drinks=${state.drinks}
            .categories=${state.categories}
            .filters=${state.filters}
            .incrementOrderItem=${BoundActions.incrementOrderItem}
          ></drink-menue>
        </section>
        <section class="cart ${flexHideClasses}">
          <div class="cart-inner">
            <h2 id="order-cart-anchor">Bestellung</h2>
            <order-cart
              .drinks=${state.drinks}
              .order=${state.order}
              .tables=${state.tables}
              .isLocked=${state.order.locked}
              .incrementOrderItem=${BoundActions.incrementOrderItem}
              .decrementOrderItem=${BoundActions.decrementOrderItem}
              .setOrderTable=${BoundActions.setOrderTable}
              .sendOrder=${BoundActions.sendOrder}
            >
            </order-cart>
          </div>
        </section>
      </div>
      <footer class="footer">
        <span>
          Made with ❤ by the <a href="https://github.com/treehaus-space">treehaus</a> admins. (<a
            href="http://zapem.org"
            >ZapEm</a
          >, <a href="http://stupidquaker.de">EagleEye</a> and
          <a href="http://jonasmai.de">woop</a>)
        </span>
      </footer>
    </main>
  `;
}

customElements.define('drinks-app', component(App, { useShadowDOM: false }));
