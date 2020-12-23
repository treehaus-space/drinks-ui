// const Tags = [
//   {
//     id: 1,
//     name: 'koffeinhaltig',
//   },
//   {
//     id: 2,
//     name: 'Produkt des Biohof Schmidt',
//   },
//   {
//     id: 3,
//     name: 'alkoholhaltig',
//   },
//   {
//     id: 4,
//     name: 'Apfelbrand',
//   },
//   {
//     id: 5,
//     name: '10% Vol.',
//   },
//   {
//     id: 6,
//     name: 'Birnenbrand',
//   },
//   {
//     id: 7,
//     name: 'Bio',
//   },
// ];

export const Filters: Filter[] = [
  {
    id: 'ALL',
    name: 'Zeige Alles',
    active: true,
    exclusive: [],
    filterFn: () => true,
  },
  {
    id: 'no-alcohol',
    name: 'alkoholfrei',
    active: false,
    exclusive: [],
    filterFn: (drink: Drink) => !drink.tags.some((tag: Tag) => tag.name === 'alkoholhaltig'),
  },
  {
    id: 'only-bio',
    name: 'Bio',
    active: false,
    exclusive: [],
    filterFn: (drink: Drink) => drink.tags.some((tag: Tag) => tag.name === 'Bio'),
  },
  {
    id: 'only-schmidt',
    name: 'Biohof Schmidt',
    active: false,
    exclusive: [],
    filterFn: (drink: Drink) =>
      drink.tags.some((tag: Tag) => tag.name === 'Produkt des Biohof Schmidt'),
  },
  {
    id: 'with-coffein',
    name: 'mit Koffein',
    active: false,
    exclusive: ['without-coffein'],
    filterFn: (drink: Drink) => drink.tags.some((tag: Tag) => tag.name === 'koffeinhaltig'),
  },
  {
    id: 'without-coffein',
    name: 'ohne Koffein',
    active: false,
    exclusive: ['with-coffein'],
    filterFn: (drink: Drink) => !drink.tags.some((tag: Tag) => tag.name === 'koffeinhaltig'),
  },
];
