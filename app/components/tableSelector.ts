import { html } from 'lit-html';
import { component } from 'haunted';
import { classMap } from 'lit-html/directives/class-map';

import { debounce } from '../util/utils';

function TableSelector({
  tables,
  setOrderTable,
  table,
}: {
  tables: Table[];
  setOrderTable: () => {};
  table: string;
}) {
  const debouncedSetOrderTable = debounce(setOrderTable);

  return html`
    <style>
      #table-input {
        background: transparent;
        padding: 0.5rem 0.5rem;
        margin: 0 0.5rem;
        font-family: inherit;
        font-size: 1.1rem;
        text-align: left;
        border-bottom-right-radius: 225px 5px;
        border-bottom-left-radius: 25px 10px;
        border: 0 solid #424242;
        border-bottom-width: 3px;
      }
      #table-delete {
        margin-left: -20px;
      }
      .transparent {
        opacity: 0;
      }
    </style>
    <label for="table-input">Wohin? </label>
    <input
      id="table-input"
      type="text"
      size="16"
      autocomplete
      required
      .value=${table}
      list="table-list"
      @input=${(e: { target: HTMLInputElement }) => debouncedSetOrderTable(e.target.value)}
    />
    <div
      id="table-delete"
      class="icon-button ripple ${classMap({ transparent: !table })}"
      @click=${() => debouncedSetOrderTable('')}
    >
      x
    </div>
    <datalist id="table-list">
      ${Object.values(tables).map((table) => html`<option>${table.name}</option>`)}
    </datalist>
  `;
}

customElements.define(
  'table-selector',
  // @ts-ignore https://github.com/matthewp/haunted/issues/177
  component(TableSelector, { useShadowDOM: false, observedAttributes: ['table'] })
);
