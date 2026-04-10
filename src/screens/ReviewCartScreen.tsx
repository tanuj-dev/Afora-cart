import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReviewSectionCard } from '../components/ReviewSectionCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SimilarProductCard } from '../components/SimilarProductCard';
import { COLORS } from '../constants/colors';
import { outOfStockProductIds, similarProductIds } from '../constants/products';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  clearCart,
  decrementQty,
  incrementQty,
  setDeliveryAddress,
  setSelectedCoupon,
  setQty,
} from '../redux/cartSlice';
import {
  closeOptionsModal,
  navigateToOrderSuccess,
  navigateToProduct,
  openOptionsModal,
} from '../redux/uiSlice';
import { formatPrice } from '../utils/format';
import { getProductImage } from '../utils/productAssets';

const outOfStockSet = new Set(outOfStockProductIds);

function isProductIdOutOfStock(productId: string): boolean {
  if (outOfStockSet.has(productId)) {
    return true;
  }
  const baseId = productId.replace(/__2x$/, '');
  return outOfStockSet.has(baseId);
}

function isLineOutOfStock(sourceProductIds: string[]): boolean {
  return sourceProductIds.some(id => isProductIdOutOfStock(id));
}

/** Areas we do not deliver to (matched case-insensitively on substring). */
const NON_SERVICEABLE_SUBSTRINGS = ['noida', 'delhi'] as const;

function isAddressNonServiceable(address: string | null): boolean {
  if (!address?.trim()) {
    return false;
  }
  const lower = address.trim().toLowerCase();
  return NON_SERVICEABLE_SUBSTRINGS.some(sub => lower.includes(sub));
}

export function ReviewCartScreen() {
  const dispatch = useAppDispatch();
  const {
    productsById,
    customerAlsoBoughtIds,
    quantitiesByProductId,
    selectedCouponId,
    deliveryAddress,
    selectedProductId,
  } = useAppSelector(state => ({
    productsById: state.products.productsById,
    customerAlsoBoughtIds: state.products.customerAlsoBoughtIds,
    quantitiesByProductId: state.cart.quantitiesByProductId,
    selectedCouponId: state.cart.selectedCouponId,
    deliveryAddress: state.cart.deliveryAddress,
    selectedProductId: state.ui.selectedProductId,
  }));
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  const cartItems = Object.values(
    Object.entries(quantitiesByProductId)
      .filter(([, qty]) => qty > 0)
      .reduce<
        Record<
          string,
          {
            mergedKey: string;
            quantity: number;
            product: (typeof productsById)[string];
            sourceProductIds: string[];
          }
        >
      >((acc, [productId, qty]) => {
        const product =
          productsById[productId] ??
          (() => {
            if (!productId.endsWith('__2x')) {
              return undefined;
            }
            const baseProductId = productId.replace(/__2x$/, '');
            const baseProduct = productsById[baseProductId];
            if (!baseProduct) {
              return undefined;
            }
            return {
              ...baseProduct,
              id: productId,
              weightLabel: `2 x ${baseProduct.weightLabel}`,
              price: baseProduct.price * 2,
              oldPrice: baseProduct.oldPrice * 2,
            };
          })();
        if (!product) {
          return acc;
        }

        const mergedKey = [
          product.title,
          product.weightLabel,
          product.price,
          product.oldPrice,
          product.imageKey,
        ].join('|');

        if (!acc[mergedKey]) {
          acc[mergedKey] = {
            mergedKey,
            quantity: 0,
            product,
            sourceProductIds: [],
          };
        }

        acc[mergedKey].quantity += qty;
        acc[mergedKey].sourceProductIds.push(productId);
        return acc;
      }, {}),
  );

  const oosCartItems = cartItems.filter(item =>
    isLineOutOfStock(item.sourceProductIds),
  );
  const inStockCartItems = cartItems.filter(
    item => !isLineOutOfStock(item.sourceProductIds),
  );
  const checkoutBlockedByOos = oosCartItems.length > 0;
  const checkoutBlockedByLocation = isAddressNonServiceable(deliveryAddress);
  const proceedDisabled = checkoutBlockedByOos || checkoutBlockedByLocation;

  const itemTotal = inStockCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const coupons = [
    {
      id: 'coupon-250',
      title: '₹250 OFF',
      subtitle: 'Upto ₹120 on orders above ₹1200',
      code: 'ABCDEFGHI',
      type: 'flat' as const,
      value: 250,
      minOrder: 1200,
    },
    {
      id: 'coupon-120',
      title: '₹120 OFF',
      subtitle: 'Upto ₹120 on orders above ₹800',
      code: 'SAVE120',
      type: 'flat' as const,
      value: 120,
      minOrder: 800,
    },
    {
      id: 'coupon-10pct',
      title: '10% OFF',
      subtitle: 'Upto ₹90 on orders above ₹500',
      code: 'SAVE10',
      type: 'percent' as const,
      value: 10,
      maxDiscount: 90,
      minOrder: 500,
    },
  ];

  const selectedCoupon = coupons.find(c => c.id === selectedCouponId) ?? null;
  const selectedCouponDiscount = selectedCoupon
    ? selectedCoupon.type === 'flat'
      ? selectedCoupon.value
      : Math.min(
          Math.floor((itemTotal * selectedCoupon.value) / 100),
          selectedCoupon.maxDiscount,
        )
    : 0;
  const maxDiscountAllowed = Math.max(0, itemTotal);
  const discount = Math.min(maxDiscountAllowed, selectedCouponDiscount);
  const platformFee = itemTotal > 0 ? 4 : 0;
  const totalPayable = Math.max(0, itemTotal - discount + platformFee);
  const cashbackGap = Math.max(0, 45 - itemTotal);
  const selectedProduct = selectedProductId
    ? productsById[selectedProductId]
    : null;
  const optionOneProductId = selectedProductId;
  const optionTwoProductId = selectedProductId
    ? `${selectedProductId}__2x`
    : null;
  const optionOneQty = optionOneProductId
    ? quantitiesByProductId[optionOneProductId] ?? 0
    : 0;
  const optionTwoQty = optionTwoProductId
    ? quantitiesByProductId[optionTwoProductId] ?? 0
    : 0;
  const hasOptionOneSelection = optionOneQty > 0;
  const hasOptionTwoSelection = optionTwoQty > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Review Cart"
          onBackPress={() => dispatch(navigateToProduct())}
          horizontalInset={12}
        />

        <View style={styles.noticeBlue}>
          <Text style={styles.noticeBlueText}>
            You are saving ₹99 with this order!
          </Text>
        </View>

        <View style={styles.noticeYellow}>
          <Image
            source={require('../assets/images/warning-icon.png')}
            style={styles.noticeYellowIcon}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.noticeYellowText}>
              Your order might be delayed due to high demand
            </Text>
            <Text style={styles.noticeYellowText}>
              Your order might be delayed due to high demand
            </Text>
          </View>
        </View>

        {oosCartItems.length > 0 && (
          <ReviewSectionCard style={styles.cartCard}>
            {oosCartItems.map(item => (
              <View key={`oos-${item.mergedKey}`} style={styles.oosLineWrap}>
                <View style={styles.oosBanner}>
                  <Text style={styles.oosBannerText}>
                    This item is out of stock
                  </Text>
                </View>
                <View style={[styles.cartRow, styles.oosCartRow]}>
                  <Image
                    source={getProductImage(item.product.imageKey)}
                    style={styles.cartImage}
                    resizeMode="contain"
                  />
                  <View style={styles.cartInfo}>
                    <Text style={styles.cartTitle}>{item.product.title}</Text>
                    <Text style={styles.cartWeight}>
                      {item.quantity} x {item.product.weightLabel}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      item.sourceProductIds.forEach(productId => {
                        dispatch(setQty({ productId, quantity: 0 }));
                      });
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ReviewSectionCard>
        )}

        <ReviewSectionCard style={styles.forgotCard}>
          <Text style={styles.forgotTitle}>Similar items</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {similarProductIds.map(productId => (
              <SimilarProductCard
                key={`similar-${productId}`}
                item={productsById[productId]}
                quantity={quantitiesByProductId[productId] ?? 0}
                onOptionsPress={id => dispatch(openOptionsModal(id))}
                onAddPress={id => dispatch(incrementQty(id))}
                onIncrementPress={id => dispatch(incrementQty(id))}
                onDecrementPress={id => dispatch(decrementQty(id))}
              />
            ))}
          </ScrollView>
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.cartCard}>
          {inStockCartItems.length === 0 ? (
            cartItems.length === 0 ? (
              <Text style={styles.emptyText}>Your cart is empty.</Text>
            ) : (
              <Text style={styles.emptyText}>
                No available items in cart. Delete unavailable items above or
                add more products.
              </Text>
            )
          ) : (
            inStockCartItems.map(item => (
              <View key={item.mergedKey} style={styles.cartRow}>
                <Image
                  source={getProductImage(item.product.imageKey)}
                  style={styles.cartImage}
                  resizeMode="contain"
                />
                <View style={styles.cartInfo}>
                  <Text style={styles.cartTitle}>{item.product.title}</Text>
                  <Text style={styles.cartWeight}>
                    {item.quantity} x {item.product.weightLabel}
                  </Text>
                </View>
                <View style={styles.rightColumn}>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      onPress={() => {
                        const targetId = item.sourceProductIds.reduce(
                          (selectedId, currentId) => {
                            const selectedItemQty =
                              quantitiesByProductId[selectedId] ?? 0;
                            const currentQty =
                              quantitiesByProductId[currentId] ?? 0;
                            return currentQty > selectedItemQty
                              ? currentId
                              : selectedId;
                          },
                          item.sourceProductIds[0],
                        );
                        if (targetId) {
                          dispatch(decrementQty(targetId));
                        }
                      }}
                    >
                      <Text style={styles.qtyText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const targetId = item.sourceProductIds[0];
                        if (targetId) {
                          dispatch(incrementQty(targetId));
                        }
                      }}
                    >
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {formatPrice(item.product.price)}
                    </Text>
                    <Text style={styles.oldPrice}>
                      {formatPrice(item.product.oldPrice)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.forgotCard}>
          <Text style={styles.forgotTitle}>Did you forget?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {customerAlsoBoughtIds.map(productId => (
              <SimilarProductCard
                key={`forgot-${productId}`}
                item={productsById[productId]}
                quantity={quantitiesByProductId[productId] ?? 0}
                onOptionsPress={id => dispatch(openOptionsModal(id))}
                onAddPress={id => dispatch(incrementQty(id))}
                onIncrementPress={id => dispatch(incrementQty(id))}
                onDecrementPress={id => dispatch(decrementQty(id))}
              />
            ))}
          </ScrollView>
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.couponCard}>
          <View style={styles.couponTitleRow}>
            <Image
              source={require('../assets/images/coupon-spark.png')}
              style={styles.couponTitleSparkIcon}
              resizeMode="contain"
            />
            <Text style={styles.couponTitle}>Top coupons for you</Text>
            <Image
              source={require('../assets/images/coupon-spark.png')}
              style={styles.couponTitleSparkIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.couponDashedLine} />
          <View style={styles.couponRow}>
            {coupons.map(coupon => {
              const isEligible = itemTotal >= coupon.minOrder;
              const isApplied = selectedCouponId === coupon.id;
              const couponTemplate = isApplied
                ? require('../assets/images/coupon-applied.png')
                : !isEligible
                ? require('../assets/images/coupon-locked.png')
                : require('../assets/images/coupon-default.png');

              return (
                <TouchableOpacity
                  key={coupon.id}
                  style={styles.couponItem}
                  activeOpacity={0.9}
                  disabled={!isEligible}
                  onPress={() =>
                    dispatch(setSelectedCoupon(isApplied ? null : coupon.id))
                  }
                >
                  <Image
                    source={couponTemplate}
                    style={styles.couponTemplateImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.couponDashedLine} />
          <View style={styles.couponSavingRow}>
            <Image
              source={require('../assets/images/coupon-party.png')}
              style={styles.couponPartyIcon}
              resizeMode="contain"
            />
            <Text style={styles.couponSavingText}>
              You are{' '}
              <Text style={styles.couponSavingValue}>
                saving {formatPrice(discount)}
              </Text>{' '}
              with this coupon
            </Text>
            <Image
              source={require('../assets/images/coupon-party.png')}
              style={styles.couponPartyIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.couponDashedLine} />
          <View style={styles.couponFooter}>
            <Text style={styles.couponFooterText}>
              View more coupons and offers
            </Text>
            <Image
              source={require('../assets/images/chevron-down.png')}
              style={styles.couponFooterArrowIcon}
              resizeMode="contain"
            />
          </View>
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.cashbackCard}>
          <Image
            source={require('../assets/images/cashback-offer.png')}
            style={styles.cashbackIcon}
            resizeMode="contain"
          />
          <View style={styles.cashbackTextWrap}>
            <Text style={styles.cashbackTitle}>
              {cashbackGap > 0
                ? `Add items worth ${formatPrice(
                    cashbackGap,
                  )} more to get 1% cashback`
                : 'You unlocked 1% cashback on this order'}
            </Text>
            <Text style={styles.cashbackSubText}>No coupon needed</Text>
          </View>
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Delivery instructions</Text>
          <View style={styles.chipsRow}>
            <View style={styles.instructionChip}>
              <Image
                source={require('../assets/images/instruction-bell.png')}
                style={styles.instructionIcon}
                resizeMode="contain"
              />
              <Text style={styles.instructionChipText}>
                Don&apos;t ring the bell
              </Text>
            </View>
            <View style={styles.instructionChip}>
              <Image
                source={require('../assets/images/instruction-call.png')}
                style={styles.instructionIcon}
                resizeMode="contain"
              />
              <Text style={styles.instructionChipText}>Don&apos;t call</Text>
            </View>
            <View
              style={[styles.instructionChip, styles.instructionChipActive]}
            >
              <Image
                source={require('../assets/images/instruction-guard.png')}
                style={styles.instructionIcon}
                resizeMode="contain"
              />
              <Text style={styles.instructionChipText}>
                Leave order with guard
              </Text>
            </View>
          </View>
          <View style={styles.instructionsInputWrap}>
            <Text style={styles.instructionsHint}>
              Type in any other instructions...
            </Text>
            <View style={styles.instructionsUnderline} />
          </View>
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.totalCard}>
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Image
                source={require('../assets/images/total-icon-rupee.png')}
                style={styles.totalRowIcon}
                resizeMode="contain"
              />
              <Text style={styles.totalLabel}>Item total</Text>
              <View style={styles.savedBadge}>
                <Text style={styles.savedBadgeText}>Saved ₹20</Text>
              </View>
            </View>
            <Text style={styles.totalValue}>{formatPrice(itemTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Image
                source={require('../assets/images/total-icon-delivery.png')}
                style={styles.totalRowIcon}
                resizeMode="contain"
              />
              <Text style={styles.totalLabel}>Delivery fee</Text>
            </View>
            <View style={styles.deliveryRight}>
              <Text style={styles.deliveryStrike}>{formatPrice(44)}</Text>
              <Text style={styles.deliveryFreeText}>FREE</Text>
            </View>
          </View>
          {!deliveryAddress && (
            <Text style={styles.deliveryHint}>
              Add items worth ₹20 to get free delivery
            </Text>
          )}
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Image
                source={require('../assets/images/total-icon-tag.png')}
                style={styles.totalRowIcon}
                resizeMode="contain"
              />
              <Text style={styles.totalLabel}>Discount</Text>
            </View>
            <Text style={styles.totalValue}>-{formatPrice(discount)}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <View style={styles.totalLeft}>
              <Image
                source={require('../assets/images/total-icon-tag.png')}
                style={styles.totalRowIcon}
                resizeMode="contain"
              />
              <Text style={styles.totalLabel}>Platform fee</Text>
            </View>
            <Text style={styles.totalValue}>-{formatPrice(platformFee)}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabelBold}>Total payable amount</Text>
            <Text style={styles.totalValueBold}>
              {formatPrice(totalPayable)}
            </Text>
          </View>
          <View style={styles.totalSavingsStrip}>
            <View style={styles.totalSavingsScallopRow}>
              {Array.from({ length: 12 }).map((_, idx) => (
                <View
                  key={`scallop-${idx}`}
                  style={styles.totalSavingsScallop}
                />
              ))}
            </View>
            <Text style={styles.totalSavingsText}>
              You are saving ₹99 with this order!
            </Text>
          </View>
        </ReviewSectionCard>

        <ReviewSectionCard style={styles.cancellationCard}>
          <Text style={styles.cancellationTitle}>Cancellation policy</Text>
          <Text style={styles.cancellationText}>
            You can cancel your order for free within the first 90 seconds.
            After that, a cancellation fee will apply.
          </Text>
        </ReviewSectionCard>
      </ScrollView>

      <View style={styles.proceedBar}>
        {deliveryAddress ? (
          <View style={styles.addressSummaryCard}>
            <View style={styles.addressTopRow}>
              <View style={styles.summaryPinWrap}>
                <Image
                  source={require('../assets/images/location-pin.png')}
                  style={styles.summaryPinIconInner}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.addressTopTextWrap}>
                {checkoutBlockedByLocation ? (
                  <Text style={styles.locationNotServiceableText}>
                    Location is not serviceable
                  </Text>
                ) : (
                  <Text style={styles.deliveryEta}>
                    Deliver in 30-60 mins⚡
                  </Text>
                )}
                <Text style={styles.savedAddress} numberOfLines={2}>
                  Home | {deliveryAddress}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setAddressInput(deliveryAddress);
                  setIsAddressModalVisible(true);
                }}
              >
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.addressBottomRow}>
              <View>
                <Text style={styles.toPayText}>To Pay</Text>
                <Text style={styles.toPayAmount}>
                  {formatPrice(totalPayable)}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  proceedDisabled && styles.proceedButtonDisabled,
                ]}
                activeOpacity={proceedDisabled ? 1 : 0.9}
                disabled={proceedDisabled}
                onPress={() => {
                  if (proceedDisabled) {
                    return;
                  }
                  dispatch(clearCart());
                  dispatch(navigateToOrderSuccess());
                }}
              >
                <Text
                  style={[
                    styles.proceedText,
                    proceedDisabled && styles.proceedTextDisabled,
                  ]}
                >
                  Proceed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.proceedButton,
              proceedDisabled && styles.proceedButtonDisabled,
            ]}
            activeOpacity={proceedDisabled ? 1 : 0.9}
            disabled={proceedDisabled}
            onPress={() => {
              setAddressInput(deliveryAddress ?? '');
              setIsAddressModalVisible(true);
            }}
          >
            <Text
              style={[
                styles.proceedText,
                proceedDisabled && styles.proceedTextDisabled,
              ]}
            >
              Proceed
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={Boolean(selectedProductId)}
        transparent
        animationType="slide"
        onRequestClose={() => dispatch(closeOptionsModal())}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalTapAway}
            onPress={() => dispatch(closeOptionsModal())}
          />
          <View style={styles.optionsSheet}>
            <Text style={styles.optionsSheetTitle}>
              {selectedProduct?.title}
            </Text>
            <View style={styles.optionsRowCard}>
              <View style={styles.optionsLeft}>
                <View style={styles.optionsImageFrame}>
                  <Image
                    source={
                      selectedProduct
                        ? getProductImage(selectedProduct.imageKey)
                        : getProductImage('dairyMilk')
                    }
                    style={styles.optionsImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.optionsMeta}>
                  <Text style={styles.optionsWeightText}>
                    1 x {selectedProduct?.weightLabel}
                  </Text>
                  <View style={styles.optionsPriceRow}>
                    <Text style={styles.optionsPriceText}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.price)
                        : ''}
                    </Text>
                    <Text style={styles.optionsOldPriceText}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.oldPrice)
                        : ''}
                    </Text>
                  </View>
                </View>
              </View>

              {hasOptionOneSelection ? (
                <View style={styles.optionsQtyControl}>
                  <TouchableOpacity
                    onPress={() =>
                      optionOneProductId &&
                      dispatch(decrementQty(optionOneProductId))
                    }
                  >
                    <Text style={styles.optionsQtyAction}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.optionsQtyValue}>{optionOneQty}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      optionOneProductId &&
                      dispatch(incrementQty(optionOneProductId))
                    }
                  >
                    <Text style={styles.optionsQtyAction}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.optionsAddButton}
                  onPress={() =>
                    optionOneProductId &&
                    dispatch(incrementQty(optionOneProductId))
                  }
                >
                  <Text style={styles.optionsAddText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.optionsRowCard}>
              <View style={styles.optionsLeft}>
                <View style={styles.optionsImageFrame}>
                  <Image
                    source={
                      selectedProduct
                        ? getProductImage(selectedProduct.imageKey)
                        : getProductImage('dairyMilk')
                    }
                    style={styles.optionsImage}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.optionsMeta}>
                  <Text style={styles.optionsWeightText}>
                    2 x {selectedProduct?.weightLabel}
                  </Text>
                  <View style={styles.optionsPriceRow}>
                    <Text style={styles.optionsPriceText}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.price * 2)
                        : ''}
                    </Text>
                    <Text style={styles.optionsOldPriceText}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.oldPrice * 2)
                        : ''}
                    </Text>
                  </View>
                </View>
              </View>

              {hasOptionTwoSelection ? (
                <View style={styles.optionsQtyControl}>
                  <TouchableOpacity
                    onPress={() =>
                      optionTwoProductId &&
                      dispatch(decrementQty(optionTwoProductId))
                    }
                  >
                    <Text style={styles.optionsQtyAction}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.optionsQtyValue}>{optionTwoQty}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      optionTwoProductId &&
                      dispatch(incrementQty(optionTwoProductId))
                    }
                  >
                    <Text style={styles.optionsQtyAction}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.optionsAddButton}
                  onPress={() =>
                    optionTwoProductId &&
                    dispatch(incrementQty(optionTwoProductId))
                  }
                >
                  <Text style={styles.optionsAddText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.optionsConfirmButton}
              onPress={() => dispatch(closeOptionsModal())}
            >
              <Text style={styles.optionsConfirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalTapAway}
            onPress={() => setIsAddressModalVisible(false)}
          />
          <View style={styles.addressSheet}>
            <View style={styles.addressHeaderRow}>
              <View style={styles.pinIconWrap}>
                <Image
                  source={require('../assets/images/location-pin.png')}
                  style={styles.pinIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.addressTitle}>
                Where would you like us to deliver?
              </Text>
            </View>
            <TextInput
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="Enter delivery address"
              placeholderTextColor="#a8a8a8"
              style={styles.addressInput}
            />
            <TouchableOpacity
              style={styles.addAddressButton}
              activeOpacity={0.9}
              onPress={() => {
                const finalAddress = addressInput.trim();
                if (!finalAddress) {
                  return;
                }
                dispatch(setDeliveryAddress(finalAddress));
                setIsAddressModalVisible(false);
              }}
            >
              <Text style={styles.addAddressText}>Add address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1, backgroundColor: '#f3f3f3' },
  content: { paddingHorizontal: 12, paddingTop: 0, paddingBottom: 110 },
  noticeBlue: {
    backgroundColor: '#DAF6FC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  noticeBlueBottom: {
    backgroundColor: '#d6eff8',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  noticeBlueText: {
    textAlign: 'center',
    color: '#0f7b94',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  noticeYellow: {
    borderWidth: 1,
    borderColor: '#f0b429',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    backgroundColor: '#FBF6E7',
  },
  noticeYellowIcon: { width: 20, height: 20, marginTop: 2 },
  noticeYellowText: {
    color: '#6d6d6d',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  cartCard: { backgroundColor: 'white', borderRadius: 16, padding: 10 },
  oosLineWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0c4c4',
  },
  oosBanner: {
    backgroundColor: '#fdecec',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  oosBannerText: {
    color: '#c92a2a',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  oosCartRow: {
    marginBottom: 0,
    borderRadius: 0,
    borderWidth: 0,
  },
  deleteButton: {
    borderWidth: 1.5,
    borderColor: COLORS.button,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  deleteButtonText: {
    color: COLORS.button,
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    paddingVertical: 12,
    fontFamily: 'Inter-Medium',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  cartImage: { width: 54, height: 54 },
  cartInfo: { flex: 1, marginLeft: 10 },
  cartTitle: {
    fontSize: 16 / 1.2,
    fontWeight: '600',
    color: '#323232',
    fontFamily: 'Inter-Medium',
  },
  cartWeight: {
    fontSize: 12,
    color: '#9a9a9a',
    marginTop: 2,
    fontFamily: 'Inter-Medium',
  },
  rightColumn: { alignItems: 'flex-end', gap: 6 },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 0.5,
    borderColor: COLORS.button,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 5,
    minWidth: 98,
    justifyContent: 'space-between',
  },
  qtyText: {
    fontSize: 20,
    color: COLORS.button,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  qtyValue: { fontSize: 15, color: '#2a2a2a', fontFamily: 'Inter-Medium' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1A1A1A',
    fontFamily: 'Inter-Medium',
  },
  oldPrice: {
    fontSize: 12,
    color: '#b8b8b8',
    textDecorationLine: 'line-through',
    fontFamily: 'Inter-Medium',
  },
  forgotCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 10,
    marginTop: 14,
  },
  forgotTitle: {
    fontSize: 19,
    fontWeight: '600',
    marginBottom: 8,
    color: 'black',
    fontFamily: 'Inter-Medium',
  },
  couponCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginTop: 14,
  },
  couponTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  couponTitleSparkIcon: {
    width: 24,
    height: 24,
    marginTop: 1,
  },
  couponTitle: {
    textAlign: 'center',
    color: '#167a93',
    fontWeight: '700',
    fontSize: 21 / 1.4,
    fontFamily: 'Inter-Medium',
  },
  couponDashedLine: {
    borderTopWidth: 1.2,
    borderTopColor: '#d5d5d5',
    borderStyle: 'dashed',
    marginTop: 12,
  },
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 0,
  },
  couponItem: {
    width: '32%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  couponTemplateImage: {
    width: '100%',
    height: 146,
  },
  couponBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1885a1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -44,
  },
  couponBadgeText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  couponSubText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#949494',
    textAlign: 'center',
    minHeight: 68,
    paddingHorizontal: 8,
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  couponSubTextLocked: {
    color: '#e35b63',
  },
  couponCode: {
    fontSize: 19,
    color: '#111',
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  couponDividerWrap: {
    width: '100%',
    position: 'relative',
    marginBottom: 0,
  },
  couponTicketDivider: {
    width: '100%',
    borderTopWidth: 1.2,
    borderTopColor: '#d5d5d5',
    borderStyle: 'dashed',
  },
  couponNotchLeft: {
    position: 'absolute',
    left: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ededed',
    borderWidth: 1,
    borderColor: '#d2d2d2',
  },
  couponNotchRight: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ededed',
    borderWidth: 1,
    borderColor: '#d2d2d2',
  },
  couponBtn: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 0,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  couponBtnDisabled: {
    backgroundColor: '#f4f4f4',
  },
  couponBtnApplied: { backgroundColor: '#f79546' },
  couponBtnText: {
    fontSize: 16.5,
    color: '#f07f2a',
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  couponBtnTextDisabled: {
    color: '#efb583',
  },
  couponBtnTextApplied: {
    color: '#fff',
  },
  couponSavingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  couponPartyIcon: {
    width: 22,
    height: 22,
  },
  couponSavingText: {
    textAlign: 'center',
    color: '#167a93',
    fontSize: 22 / 1.5,
    fontFamily: 'Inter-Medium',
  },
  couponSavingValue: {
    fontWeight: '700',
    color: '#167a93',
    fontFamily: 'Inter-Medium',
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingHorizontal: 8,
    paddingBottom: 2,
  },
  couponFooterText: {
    fontSize: 14,
    color: '#6D6D6D',
    fontFamily: 'Inter-Medium',
  },
  couponFooterArrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#9f9f9f',
    transform: [{ rotate: '-90deg' }],
  },
  cashbackCard: {
    backgroundColor: 'white',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashbackIcon: {
    width: 56,
    height: 56,
    marginRight: 10,
  },
  cashbackTextWrap: {
    flex: 1,
  },
  cashbackTitle: {
    fontSize: 15,
    color: 'black',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  cashbackSubText: {
    fontSize: 18 / 1.4,
    color: '#9a9a9a',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  instructionsTitle: {
    fontSize: 15,
    color: '#202020',
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Inter-Medium',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  instructionChip: {
    borderWidth: 1,
    borderColor: '#d4d4d4',
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructionChipActive: {
    borderColor: '#e7b47d',
    backgroundColor: '#fdfaf6',
  },
  instructionIcon: {
    width: 20,
    height: 20,
  },
  instructionChipText: {
    fontSize: 13,
    color: '#232323',
    fontFamily: 'Inter-Medium',
  },
  instructionsInputWrap: {
    marginTop: 2,
  },
  instructionsHint: {
    fontSize: 14,
    color: '#b5b5b5',
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  instructionsUnderline: {
    borderTopWidth: 1.5,
    borderTopColor: '#dbdbdb',
  },
  totalCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    paddingTop: 12,
    marginTop: 14,
    overflow: 'hidden',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  totalRowIcon: {
    width: 24,
    height: 24,
  },
  savedBadge: {
    backgroundColor: '#f8eadb',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savedBadgeText: {
    color: '#de8529',
    fontSize: 10.5,
    fontFamily: 'Inter-Medium',
  },
  totalLabel: { fontSize: 13, color: '#444', fontFamily: 'Inter-Medium' },
  totalValue: {
    fontSize: 13,
    color: 'black',
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  deliveryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryStrike: {
    color: '#b0b0b0',
    textDecorationLine: 'line-through',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  deliveryFreeText: {
    color: '#FF8F1F',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  deliveryHint: {
    fontSize: 15,
    color: '#de8529',
    marginTop: -4,
    marginBottom: 10,
    paddingHorizontal: 12,
    fontFamily: 'Inter-Medium',
  },
  totalDivider: {
    borderTopWidth: 1.2,
    borderTopColor: '#e6e6e6',
    borderStyle: 'dashed',
    marginVertical: 8,
    marginHorizontal: 12,
  },
  totalLabelBold: {
    fontSize: 14,
    color: 'black',
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'Inter-Medium',
  },
  totalValueBold: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'Inter-Medium',
  },
  totalSavingsStrip: {
    marginTop: 12,
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#DAF6FC',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
  },
  totalSavingsScallopRow: {
    position: 'absolute',
    top: -14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  totalSavingsScallop: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
  },
  totalSavingsText: {
    textAlign: 'center',
    color: '#0f7b94',
    fontWeight: '700',
    fontSize: 19 / 1.4,
    fontFamily: 'Inter-Medium',
  },
  cancellationCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    marginBottom: 100,
  },
  cancellationTitle: {
    fontSize: 14,
    color: '#2b2b2b',
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  cancellationText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#a2a2a2',
    marginTop: 4,
    fontFamily: 'Inter-Medium',
  },
  proceedBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  addressSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 22,
    borderWidth: 0,
    borderColor: '#e2e2e2',
    overflow: 'hidden',
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  summaryPinWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: '#0f7b94',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPinIconInner: {
    width: 24,
    height: 24,
    tintColor: '#0f7b94',
  },
  addressTopTextWrap: {
    flex: 1,
  },
  deliveryEta: {
    color: '#222',
    fontSize: 18 / 1.2,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  locationNotServiceableText: {
    color: '#d6455c',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  savedAddress: {
    color: '#7b7b7b',
    fontSize: 17 / 1.3,
    marginTop: 2,
    fontFamily: 'Inter-Medium',
  },
  changeText: {
    color: COLORS.button,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  addressBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toPayText: {
    fontSize: 17 / 1.3,
    color: '#9d9d9d',
    fontFamily: 'Inter-Medium',
  },
  toPayAmount: {
    marginTop: 2,
    fontSize: 17,
    color: '#1f1f1f',
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  proceedButton: {
    backgroundColor: '#55913D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 152,
    paddingHorizontal: 22,
  },
  proceedButtonDisabled: {
    backgroundColor: '#b8d4a8',
    opacity: 0.85,
  },
  proceedText: {
    color: '#f8fff8',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  proceedTextDisabled: {
    color: '#eef6ee',
  },
  optionsSheet: {
    backgroundColor: '#efefef',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },
  optionsSheetTitle: {
    color: '#1f2024',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  optionsRowCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dddddd',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  optionsImageFrame: {
    width: 58,
    height: 58,
    borderRadius: 9,
    backgroundColor: '#efefef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8d8d8',
  },
  optionsImage: {
    width: 22,
    height: 44,
  },
  optionsMeta: {
    marginLeft: 10,
    flexShrink: 1,
  },
  optionsWeightText: {
    color: '#b0b0b0',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  optionsPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 1,
  },
  optionsPriceText: {
    color: '#1e1f23',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  optionsOldPriceText: {
    color: '#b8b8b8',
    fontSize: 12,
    textDecorationLine: 'line-through',
    fontFamily: 'Inter-Medium',
  },
  optionsQtyControl: {
    height: 40,
    minWidth: 102,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: COLORS.button,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  optionsQtyAction: {
    color: COLORS.button,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  optionsQtyValue: {
    color: '#2b2d31',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  optionsAddButton: {
    height: 40,
    minWidth: 102,
    borderRadius: 10,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  optionsAddText: {
    color: '#f1f9f1',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  optionsConfirmButton: {
    marginTop: 6,
    backgroundColor: COLORS.button,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  optionsConfirmText: {
    color: '#f1f9f1',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalTapAway: { flex: 1 },
  addressSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pinIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f7b94',
  },
  pinIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  addressTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    fontFamily: 'Inter-Medium',
  },
  addressInput: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    marginBottom: 12,
    color: '#222',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  addAddressButton: {
    backgroundColor: COLORS.button,
    borderRadius: 14,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAddressText: {
    color: '#f5fff5',
    fontSize: 20 / 1.3,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
});
