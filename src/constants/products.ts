export type ProductCTA = 'options' | 'add';

export type Product = {
  id: string;
  brand: string;
  title: string;
  weightLabel: string;
  price: number;
  oldPrice: number;
  imageKey: 'dairyMilk' | 'skyr' | 'chocoHearts';
  cta: ProductCTA;
};

export const productsById: Record<string, Product> = {
  main: {
    id: 'main',
    brand: 'Cadbury',
    title: 'Dairy milk Silk Chocolate Bar',
    weightLabel: '64 g',
    price: 444,
    oldPrice: 444,
    imageKey: 'dairyMilk',
    cta: 'options',
  },
  '1': {
    id: '1',
    brand: 'Tata Tea',
    title: 'Gold Premium Assam Tea Rich...',
    weightLabel: '1kg',
    price: 444,
    oldPrice: 444,
    imageKey: 'skyr',
    cta: 'options',
  },
  '2': {
    id: '2',
    brand: 'Tata Tea',
    title: 'Gold Premium Assam Tea Rich...',
    weightLabel: '1kg',
    price: 444,
    oldPrice: 444,
    imageKey: 'skyr',
    cta: 'options',
  },
  '3': {
    id: '3',
    brand: 'Tata Tea',
    title: 'Organic apple',
    weightLabel: '1kg',
    price: 444,
    oldPrice: 444,
    imageKey: 'chocoHearts',
    cta: 'add',
  },
  c1: {
    id: 'c1',
    brand: 'Tata Tea',
    title: 'Gold Premium Assam Tea Rich...',
    weightLabel: '1kg',
    price: 444,
    oldPrice: 444,
    imageKey: 'skyr',
    cta: 'options',
  },
  c2: {
    id: 'c2',
    brand: 'Tata Tea',
    title: 'Gold Premium Assam Tea Rich...',
    weightLabel: '1kg',
    price: 444,
    oldPrice: 444,
    imageKey: 'skyr',
    cta: 'options',
  },
  c3: {
    id: 'c3',
    brand: 'Tata Tea',
    title: 'Organic apple',
    weightLabel: '1kg',
    price: 444,
    oldPrice: 444,
    imageKey: 'chocoHearts',
    cta: 'add',
  },
};

export const similarProductIds = ['1', '2', '3'];
export const customerAlsoBoughtIds = ['c1', 'c2', 'c3'];
