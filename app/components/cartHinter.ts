import { component, useEffect, useReducer } from 'haunted';
import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map';
import throttle from 'lodash/throttle';

type CartHinterState = { lastScrollPos: number };
type CartHinterAction = { type: any; newScrollPos?: number };
type CartHinterProps = { orderListLength: number };
const initialState = { lastScrollPos: 0 };
const SET_LAST_SCROLL_POS = 'SET_LAST_SCROLL_POS';

function reducer(state: CartHinterState, action: CartHinterAction) {
  switch (action.type) {
    case SET_LAST_SCROLL_POS:
      if (Math.abs(state.lastScrollPos - action.newScrollPos) >= 100) {
        return { lastScrollPos: action.newScrollPos };
      }
      return state;
    default:
      throw new Error();
  }
}

function CartHinter({ orderListLength }: CartHinterProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () =>
      window.addEventListener(
        'scroll',
        throttle(() => dispatch({ type: SET_LAST_SCROLL_POS, newScrollPos: window.scrollY }), 200)
      ),
    []
  );

  const cartAnchorPos = document.getElementById('order-cart-anchor').getBoundingClientRect().top;
  const cartAreaIsNotVisible = cartAnchorPos > window.innerHeight * 0.7 || cartAnchorPos < -30;
  const cartHinterShouldBeVisible = Number(orderListLength) > 0 && cartAreaIsNotVisible;

  return html`
    <a
      href="#order-cart-anchor"
      class="ripple"
      style=${styleMap({
        display: 'block',
        pointerEvents: cartHinterShouldBeVisible ? 'all' : 'none',
        opacity: cartHinterShouldBeVisible ? '1' : '0',
        transition: 'opacity 0.8s ease-in-out',
      })}
      >🛒</a
    >
  `;
}

const CartHinterComponent = component(CartHinter, HTMLElement, {
  useShadowDOM: false,
  observedAttributes: ['orderListLength'],
});
// @ts-ignore https://github.com/matthewp/haunted/issues/177
customElements.define('cart-hinter', CartHinterComponent);
