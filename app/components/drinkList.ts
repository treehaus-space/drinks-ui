import { html } from 'lit-html';
import { component } from 'haunted';

type Props = {
  drinks: Drink[];
  incrementOrderItem: (id: number) => void;
};

type Drink = {
  id: number;
  name: string;
};

function DrinkList({ drinks, incrementOrderItem }: Props) {
  return html`
    <ul>
      ${Object.values(drinks).map(
        (drink) => html`
          <li class="drink-item drink-text ripple" @click=${() => incrementOrderItem(drink.id)}>
            ${drink.name}
          </li>
        `
      )}
    </ul>
  `;
}
// @ts-ignore https://github.com/matthewp/haunted/issues/177
customElements.define('drink-list', component(DrinkList, { useShadowDOM: false }));
