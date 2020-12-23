type Category = {
  id: number;
  name: string;
};
type Tag = {
  id: number;
  name: string;
  exclude: boolean;
};
type Filter = {
  id: any;
  name: string;
  active: boolean;
  exclusive: string[];
  filterFn: (drink: Drink) => boolean;
};
type Drink = {
  id: number;
  name: string;
  categories: Category[];
  tags: Tag[];
};
type Item = {
  count: number;
  id: number;
};

type Table = {
  name: string;
};

type Order = {
  locked: boolean;
  table: string;
  items: Item[];
  hideHinter: boolean;
};

type State = {
  drinks: { [key: string]: Drink };
  categories: Category[];
  tags: Tag[];
  tables: Table[];
  filters: Filter[];
  order: Order;
};

type InitialData = {
  drinks: { [key: string]: Drink };
  categories: Category[];
  tags: Tag[];
  tables: Table[];
};
