export const fetchInitialData = async () => {
  const [drinks, categories, tags, tables] = await Promise.all([
    fetchDrinks(),
    fetchCategories(),
    fetchTags(),
    fetchTables(),
  ]);

  return { drinks, categories, tags, tables };
};

const fetchDrinks = async () => {
  const response = await fetch('../drinks');
  const data = await response.json();

  // convert array to object using id as key
  return data.reduce((drinks: Drink[], drink: Drink) => {
    drinks[drink.id] = drink;
    return drinks;
  }, {});
};

const fetchCategories = async () => {
  const response = await fetch('../categories');
  return await response.json();
};

const fetchTags = async () => {
  const response = await fetch('../tags');
  return await response.json();
};

const fetchTables = async () => {
  const response = await fetch('../tables');
  const tables = await response.json();
  return tables.sort(tableSorter);
};

export const tableSorter = (table1: Table, table2: Table) => {
  const name1 = table1.name.toUpperCase();
  const name2 = table2.name.toUpperCase();
  return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
};

export const postOrder = async (order: Order) => {
  const parsedOrder = {
    table: order.table,
    items: order.items.map((item: Item) => ({
      amount: item.count,
      drink_id: item.id,
    })),
  };
  const response = await fetch('../order', {
    method: 'post',
    body: JSON.stringify(parsedOrder),
  });
  return await response.json();
};
