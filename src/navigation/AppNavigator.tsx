import React from 'react';
import {ProductDetailsScreen} from '../screens/ProductDetailsScreen';
import {ReviewCartScreen} from '../screens/ReviewCartScreen';
import {useAppSelector} from '../hooks/redux';

export function AppNavigator() {
  const currentScreen = useAppSelector(state => state.ui.currentScreen);
  if (currentScreen === 'reviewCart') {
    return <ReviewCartScreen />;
  }
  return <ProductDetailsScreen />;
}
