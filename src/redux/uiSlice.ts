import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type UIState = {
  selectedProductId: string | null;
  currentScreen: 'product' | 'reviewCart' | 'orderSuccess';
};

const initialState: UIState = {
  selectedProductId: null,
  currentScreen: 'product',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openOptionsModal(state, action: PayloadAction<string>) {
      state.selectedProductId = action.payload;
    },
    closeOptionsModal(state) {
      state.selectedProductId = null;
    },
    navigateToReviewCart(state) {
      state.currentScreen = 'reviewCart';
    },
    navigateToProduct(state) {
      state.currentScreen = 'product';
    },
    navigateToOrderSuccess(state) {
      state.currentScreen = 'orderSuccess';
      state.selectedProductId = null;
    },
  },
});

export const {
  openOptionsModal,
  closeOptionsModal,
  navigateToReviewCart,
  navigateToProduct,
  navigateToOrderSuccess,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
