import React from 'react';
import { OrderSuccessScreen } from '../screens/OrderSuccessScreen';
import { ProductDetailsScreen } from '../screens/ProductDetailsScreen';
import { ReviewCartScreen } from '../screens/ReviewCartScreen';
import { useAppSelector } from '../hooks/redux';

export function AppNavigator() {
  const currentScreen = useAppSelector(state => state.ui.currentScreen);
  if (currentScreen === 'orderSuccess') {
    return <OrderSuccessScreen />;
  }
  if (currentScreen === 'reviewCart') {
    return <ReviewCartScreen />;
  }
  return <ProductDetailsScreen />;
}
