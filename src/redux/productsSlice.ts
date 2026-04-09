import {createSlice} from '@reduxjs/toolkit';
import {
  customerAlsoBoughtIds,
  productsById,
  similarProductIds,
} from '../constants/products';

const initialState = {
  productsById,
  mainProductId: 'main',
  similarProductIds,
  customerAlsoBoughtIds,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
});

export const productsReducer = productsSlice.reducer;
