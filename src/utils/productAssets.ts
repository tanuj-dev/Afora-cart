import {ImageSourcePropType} from 'react-native';
import {Product} from '../constants/products';

const productImageMap: Record<Product['imageKey'], ImageSourcePropType> = {
  dairyMilk: require('../assets/images/dairy-milk.png'),
  skyr: require('../assets/images/skyr.png'),
  chocoHearts: require('../assets/images/choco-hearts.png'),
};

export function getProductImage(imageKey: Product['imageKey']): ImageSourcePropType {
  return productImageMap[imageKey];
}
