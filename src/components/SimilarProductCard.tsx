import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { Product } from '../constants/products';
import { formatPrice } from '../utils/format';
import { getProductImage } from '../utils/productAssets';

type Props = {
  item: Product;
  quantity: number;
  onOptionsPress?: (productId: string) => void;
  onAddPress?: (productId: string) => void;
  onIncrementPress?: (productId: string) => void;
  onDecrementPress?: (productId: string) => void;
};

export function SimilarProductCard({
  item,
  quantity,
  onOptionsPress,
  onAddPress,
  onIncrementPress,
  onDecrementPress,
}: Props) {
  const handlePress = () => {
    if (item.cta === 'options') {
      onOptionsPress?.(item.id);
      return;
    }
    onAddPress?.(item.id);
  };

  return (
    <View style={styles.similarItem}>
      <Image
        source={require('../assets/images/discount-badge.png')}
        style={styles.smallBadge}
        resizeMode="contain"
      />
      <Image
        source={getProductImage(item.imageKey)}
        style={styles.similarImage}
        resizeMode="contain"
      />
      <View style={styles.infoBlock}>
        <Text style={styles.similarBrand}>{item.brand}</Text>
        <Text numberOfLines={2} style={styles.similarTitle}>
          {item.title}
        </Text>
        <Text style={styles.similarWeight}>{item.weightLabel}</Text>
      </View>
      <View style={styles.bottomBlock}>
        <View style={styles.similarPriceRow}>
          <Text style={styles.similarPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.similarOldPrice}>
            {formatPrice(item.oldPrice)}
          </Text>
        </View>
        {quantity > 0 ? (
          <View style={styles.qtyControl}>
            <TouchableOpacity
              onPress={() => onDecrementPress?.(item.id)}
              hitSlop={8}
              activeOpacity={0.8}
            >
              <Text style={styles.qtyAction}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => onIncrementPress?.(item.id)}
              hitSlop={8}
              activeOpacity={0.8}
            >
              <Text style={styles.qtyAction}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.smallButton}
            onPress={handlePress}
            activeOpacity={0.85}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.smallButtonText}>
                {item.cta === 'options' ? '2 options' : 'Add'}
              </Text>
              {item.cta === 'options' && (
                <Image
                  source={require('../assets/images/chevron-down.png')}
                  style={styles.chevronIcon}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  similarItem: {
    width: 126,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 9,
    padding: 7,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  smallBadge: {
    width: 34,
    height: 34,
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
  },
  similarImage: {
    height: 88,
    width: 88,
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  infoBlock: {
    flex: 1,
  },
  similarBrand: {
    color: '#9d9da1',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  similarTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Medium',
  },
  similarWeight: {
    color: '#9d9da1',
    fontSize: 10.5,
    marginTop: 2,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  bottomBlock: {
    marginTop: 'auto',
  },
  similarPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  similarPrice: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  similarOldPrice: {
    color: COLORS.strike,
    fontSize: 10.5,
    textDecorationLine: 'line-through',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  smallButton: {
    marginTop: 6,
    borderRadius: 7,
    backgroundColor: COLORS.button,
    paddingVertical: 7,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyControl: {
    marginTop: 6,
    minHeight: 32,
    borderRadius: 7,
    borderWidth: 1.4,
    borderColor: COLORS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  qtyAction: {
    color: COLORS.button,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  qtyValue: {
    color: COLORS.button,
    fontSize: 12.5,
    fontFamily: 'Inter-Medium',
  },
  smallButtonText: {
    color: '#f3fbf3',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  chevronIcon: {
    width: 18,
    height: 16,
    tintColor: '#f3fbf3',
    // transform: [{rotate: '180deg'}],
  },
});
