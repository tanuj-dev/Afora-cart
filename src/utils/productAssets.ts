import {ImageSourcePropType} from 'react-native';
import {Product} from '../constants/products';

const productImageMap: Record<Product['imageKey'], ImageSourcePropType> = {
  dairyMilk: require('../assets/images/dairy-milk.png'),
  skyr: require('../assets/images/skyr.png'),
  chocoHearts: require('../assets/images/choco-hearts.png'),
  laysSaltVinegar: require('../assets/images/lays-salt-vinegar.jpg'),
  laysClassic: require('../assets/images/lays-classic.jpg'),
  laysClassicKetchup: require('../assets/images/lays-classic-ketchup.png'),
};

export function getProductImage(imageKey: Product['imageKey']): ImageSourcePropType {
  return productImageMap[imageKey];
}
