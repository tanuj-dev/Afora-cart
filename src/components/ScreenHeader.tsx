import React, { ReactNode } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  title: string;
  onBackPress?: () => void;
  rightNode?: ReactNode;
  horizontalInset?: number;
};

export function ScreenHeader({
  title,
  onBackPress,
  rightNode,
  horizontalInset = 0,
}: Props) {
  return (
    <View
      style={[
        styles.header,
        horizontalInset ? { marginHorizontal: -horizontalInset } : null,
      ]}
    >
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backButton}
        activeOpacity={0.8}
      >
        <Image
          source={require('../assets/images/back-arrow.png')}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightSlot}>{rightNode ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    // borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
    marginBottom: 10,
    // borderWidth: 1,
    borderColor: '#ebebeb',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#292929',
    fontFamily: 'Inter-Medium',
  },
  rightSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
