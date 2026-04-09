import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ReviewSectionCard({ children, style }: Props) {
  return <View style={[styles.baseCard, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
  },
});

