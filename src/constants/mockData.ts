import {ImageSourcePropType} from 'react-native';

export type SimilarProduct = {
  id: string;
  brand: string;
  title: string;
  weight: string;
  price: string;
  oldPrice: string;
  image: ImageSourcePropType;
  cta: 'options' | 'add';
};

export const similarProducts: SimilarProduct[] = [
  {
    id: '1',
    brand: 'Tata Tea',
    title: 'Gold Premium Assam Tea Rich...',
    weight: '1kg',
    price: '₹444',
    oldPrice: '₹444',
    image: require('../assets/images/skyr.png'),
    cta: 'options',
  },
  {
    id: '2',
    brand: 'Tata Tea',
    title: 'Gold Premium Assam Tea Rich...',
    weight: '1kg',
    price: '₹444',
    oldPrice: '₹444',
    image: require('../assets/images/skyr.png'),
    cta: 'options',
  },
  {
    id: '3',
    brand: 'Tata Tea',
    title: 'Organic apple',
    weight: '1kg',
    price: '₹444',
    oldPrice: '₹444',
    image: require('../assets/images/choco-hearts.png'),
    cta: 'add',
  },
];
