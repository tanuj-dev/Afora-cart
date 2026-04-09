import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type UIState = {
  selectedProductId: string | null;
  currentScreen: 'product' | 'reviewCart';
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
  },
});

export const {
  openOptionsModal,
  closeOptionsModal,
  navigateToReviewCart,
  navigateToProduct,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
