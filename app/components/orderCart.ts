import { html } from 'lit-html';
import { component } from 'haunted';

function OrderCart({
  drinks,
  tables,
  order,
  incrementOrderItem,
  decrementOrderItem,
  setOrderTable,
  sendOrder,
  isLocked,
}: any) {
  const plusButton = (drinkID: any) => html`
    <div
      class="icon-button ripple"
      @click=${() => (isLocked ? false : incrementOrderItem(drinkID))}
    >
      +
    </div>
  `;

  const minusButton = (drinkID: any) => html`
    <div
      class="icon-button ripple"
      @click=${() => (isLocked ? false : decrementOrderItem(drinkID))}
    >
      -
    </div>
  `;

  const isOrderValid = () => order.items.length >= 1 && order.table !== '';

  const handleSendOrder = () => {
    if (isLocked) {
      return false;
    }

    if (!isOrderValid()) {
      document.getElementById('table-input').focus();
      return false;
    }

    sendOrder();
  };

  return html`
    <table-selector
      .table=${order.table}
      .tables=${tables}
      .setOrderTable=${setOrderTable}
    ></table-selector>
    <ul>
      ${order.items.map(
        (item: { count: unknown; id: string | number }) => html`
          <li class="order-item drink-text">
            <div class="item-left">${item.count}x</div>
            <div class="item-middle">${drinks[item.id].name}</div>
            <div class="item-right">
              ${minusButton(item.id)}${plusButton(item.id)}
            </div>
          </li>
        `
      )}
    </ul>
    <div
      @click=${() => handleSendOrder()}
      class="text-button ripple ${isOrderValid() ? '' : 'disabled'}"
    >
      Jetzt Bestellen
    </div>
  `;
}

// @ts-ignore https://github.com/matthewp/haunted/issues/177
customElements.define('order-cart', component(OrderCart, { useShadowDOM: false }));
