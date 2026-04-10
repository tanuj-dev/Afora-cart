import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type CartState = {
  quantitiesByProductId: Record<string, number>;
  selectedCouponId: string | null;
  deliveryAddress: string | null;
};

const initialState: CartState = {
  quantitiesByProductId: {},
  selectedCouponId: null,
  deliveryAddress: null,
};

type CartPersistencePayload = {
  quantitiesByProductId: Record<string, number>;
  selectedCouponId: string | null;
  deliveryAddress: string | null;
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartPersistencePayload>) {
      state.quantitiesByProductId = action.payload.quantitiesByProductId;
      state.selectedCouponId = action.payload.selectedCouponId;
      state.deliveryAddress = action.payload.deliveryAddress;
    },
    incrementQty(state, action: PayloadAction<string>) {
      const productId = action.payload;
      const currentQty = state.quantitiesByProductId[productId] ?? 0;
      state.quantitiesByProductId[productId] = currentQty + 1;
    },
    decrementQty(state, action: PayloadAction<string>) {
      const productId = action.payload;
      const currentQty = state.quantitiesByProductId[productId] ?? 0;
      if (currentQty <= 1) {
        delete state.quantitiesByProductId[productId];
        return;
      }
      state.quantitiesByProductId[productId] = currentQty - 1;
    },
    setQty(
      state,
      action: PayloadAction<{
        productId: string;
        quantity: number;
      }>,
    ) {
      const {productId, quantity} = action.payload;
      if (quantity <= 0) {
        delete state.quantitiesByProductId[productId];
        return;
      }
      state.quantitiesByProductId[productId] = quantity;
    },
    setSelectedCoupon(state, action: PayloadAction<string | null>) {
      state.selectedCouponId = action.payload;
    },
    setDeliveryAddress(state, action: PayloadAction<string | null>) {
      state.deliveryAddress = action.payload;
    },
    clearCart(state) {
      state.quantitiesByProductId = {};
      state.selectedCouponId = null;
      state.deliveryAddress = null;
    },
  },
});

export const {
  hydrateCart,
  incrementQty,
  decrementQty,
  setQty,
  setSelectedCoupon,
  setDeliveryAddress,
  clearCart,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;
