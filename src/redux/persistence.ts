import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppDispatch, store} from './store';
import {hydrateCart} from './cartSlice';

const CART_STORAGE_KEY = '@afforacart/cart';

export async function hydrateCartFromStorage(dispatch: AppDispatch): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as
      | {
          quantitiesByProductId?: Record<string, number>;
          selectedCouponId?: string | null;
        }
      | Record<string, number>;

    if ('quantitiesByProductId' in parsed) {
      dispatch(
        hydrateCart({
          quantitiesByProductId: parsed.quantitiesByProductId ?? {},
          selectedCouponId: parsed.selectedCouponId ?? null,
          deliveryAddress: parsed.deliveryAddress ?? null,
        }),
      );
      return;
    }

    dispatch(
      hydrateCart({
        quantitiesByProductId: parsed,
        selectedCouponId: null,
        deliveryAddress: null,
      }),
    );
  } catch (error) {
    console.warn('Unable to hydrate cart from AsyncStorage', error);
  }
}

export function subscribeCartPersistence(): () => void {
  let lastSerialized = '';

  return store.subscribe(() => {
    const cartSnapshot = store.getState().cart;
    const serialized = JSON.stringify(cartSnapshot);
    if (serialized === lastSerialized) {
      return;
    }
    lastSerialized = serialized;
    AsyncStorage.setItem(CART_STORAGE_KEY, serialized).catch(error => {
      console.warn('Unable to persist cart to AsyncStorage', error);
    });
  });
}
