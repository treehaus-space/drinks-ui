import { html } from 'lit-html';
import { component } from 'haunted';

type Props = {
  filters: Filter[];
  toggleFilter: (id: string) => void;
  resetFilters: () => void;
};

const filterButton = (
  filter: Filter,
  index: number,
  toggleFilter: Props['toggleFilter'],
  resetFilters: Props['resetFilters']
) => {
  return html`
    ${index > 0 ? ' ⋮ ' : ''}
    <span
      class="filter-button"
      style=${filter.active ? 'text-decoration: underline;' : ''}
      @click=${filter.id === 'ALL' ? () => resetFilters() : () => toggleFilter(filter.id)}
      >${filter.name}</span
    >
  `;
};

function DrinkFilterBar({ filters, toggleFilter, resetFilters }: Props) {
  return html`
    <div class="sticky-content">
      ${filters.map((filter: Filter, index: any) =>
        filterButton(filter, index, toggleFilter, resetFilters)
      )}
    </div>
    <div class="sticky-shadow"></div>
  `;
}
// @ts-ignore https://github.com/matthewp/haunted/issues/177
customElements.define('drink-filter-bar', component(DrinkFilterBar, { useShadowDOM: false }));
