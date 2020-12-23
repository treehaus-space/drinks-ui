import { html } from 'lit-html';
import { component } from 'haunted';
import { filterObject } from '../util/utils';

type Props = {
  drinks: { [key: string]: Drink };
  categories: Category[];
  filters: Filter[];
  incrementOrderItem: (id: number) => void;
};

function DrinkMenue({ drinks, categories, filters, incrementOrderItem }: Props) {
  const filteredDrinkListForCategory = (category: Category) => {
    const filteredDrinksInCategory = filterObject(
      drinks,
      (drink) =>
        drink.categories.some((drinkCategory: { id: any }) => drinkCategory.id === category.id) &&
        filters.every((filter) => !filter.active || filter.filterFn(drink))
    );

    if (!Object.entries(filteredDrinksInCategory).length) {
      return null;
    }

    return html`
      <h2>${category.name}</h2>
      <drink-list .drinks=${filteredDrinksInCategory} .incrementOrderItem=${incrementOrderItem}>
      </drink-list>
    `;
  };

  const filteredCategories = categories.map((category: any) =>
    filteredDrinkListForCategory(category)
  );

  return filteredCategories.every((value) => value === null)
    ? html`
        <h3>Keine passenden Getränke gefunden</h3>
        <p>Bitte Filterauswahl anpassen</p>
      `
    : html`${filteredCategories}`;
}
// @ts-ignore https://github.com/matthewp/haunted/issues/177
customElements.define('drink-menue', component(DrinkMenue, { useShadowDOM: false }));
