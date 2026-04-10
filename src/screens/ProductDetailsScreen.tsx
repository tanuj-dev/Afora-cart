import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../components/ScreenHeader';
import { SimilarProductCard } from '../components/SimilarProductCard';
import { COLORS } from '../constants/colors';
import { Product } from '../constants/products';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { decrementQty, incrementQty } from '../redux/cartSlice';
import {
  closeOptionsModal,
  navigateToReviewCart,
  openOptionsModal,
} from '../redux/uiSlice';
import { formatPrice } from '../utils/format';
import { getProductImage } from '../utils/productAssets';

export function ProductDetailsScreen() {
  const IMAGE_FRAME_WIDTH = 108;
  const dispatch = useAppDispatch();
  const {
    productsById,
    mainProductId,
    similarProductIds,
    customerAlsoBoughtIds,
    quantitiesByProductId,
    selectedProductId,
    cartCount,
  } = useAppSelector(state => ({
    productsById: state.products.productsById,
    mainProductId: state.products.mainProductId,
    similarProductIds: state.products.similarProductIds,
    customerAlsoBoughtIds: state.products.customerAlsoBoughtIds,
    quantitiesByProductId: state.cart.quantitiesByProductId,
    selectedProductId: state.ui.selectedProductId,
    cartCount: Object.values(state.cart.quantitiesByProductId).reduce(
      (sum, qty) => sum + qty,
      0,
    ),
  }));

  const mainProduct = productsById[mainProductId];
  const selectedProduct: Product | null = selectedProductId
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
  const imageScrollRef = useRef<ScrollView>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselSlides = useMemo(
    () => [
      { source: getProductImage(mainProduct.imageKey), compact: false },
      { source: require('../assets/images/skyr.png'), compact: false },
      { source: require('../assets/images/choco-hearts.png'), compact: false },
      { source: require('../assets/images/dairy-milk.png'), compact: false },
      { source: require('../assets/images/tuc-cheezzz.jpg'), compact: true },
      { source: require('../assets/images/lays-sour-cream-dill.jpg'), compact: true },
    ],
    [mainProduct.imageKey],
  );
  const loopedCarouselSlides = useMemo(
    () => [
      carouselSlides[carouselSlides.length - 1],
      ...carouselSlides,
      carouselSlides[0],
    ],
    [carouselSlides],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      imageScrollRef.current?.scrollTo({
        x: IMAGE_FRAME_WIDTH,
        animated: false,
      });
    });
  }, [IMAGE_FRAME_WIDTH]);

  const openOptions = (productId: string) =>
    dispatch(openOptionsModal(productId));
  const closeModal = () => dispatch(closeOptionsModal());
  const addToCart = (productId: string) => dispatch(incrementQty(productId));
  const reduceFromCart = (productId: string) =>
    dispatch(decrementQty(productId));

  const handleImageCarouselEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const totalRealImages = carouselSlides.length;
    const currentPage = Math.round(
      event.nativeEvent.contentOffset.x / IMAGE_FRAME_WIDTH,
    );

    if (currentPage === 0) {
      imageScrollRef.current?.scrollTo({
        x: totalRealImages * IMAGE_FRAME_WIDTH,
        animated: false,
      });
      setActiveImageIndex(totalRealImages - 1);
      return;
    }

    if (currentPage === totalRealImages + 1) {
      imageScrollRef.current?.scrollTo({
        x: IMAGE_FRAME_WIDTH,
        animated: false,
      });
      setActiveImageIndex(0);
      return;
    }

    setActiveImageIndex(currentPage - 1);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
        translucent={false}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <ScreenHeader
          title="Dairy milk silk chocolate abcdefghitgh..."
          horizontalInset={10}
          rightNode={
            <Image
              source={require('../assets/images/share.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          }
        />

        <View style={styles.mainProductCard}>
          <Image
            source={require('../assets/images/discount-badge.png')}
            style={styles.badge}
            resizeMode="contain"
          />
          <View style={styles.mainImageFrame}>
            <ScrollView
              ref={imageScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageCarouselEnd}
              style={styles.mainImageScrollView}
              contentContainerStyle={styles.mainImageCarousel}
            >
              {loopedCarouselSlides.map((slide, idx) => (
                <View key={`main-image-${idx}`} style={styles.mainImageSlide}>
                  <Image
                    source={slide.source}
                    style={
                      slide.compact
                        ? styles.carouselImageCompact
                        : styles.mainImage
                    }
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={styles.dotsContainer}>
            {carouselSlides.map((_, idx) => (
              <View
                key={`dot-${idx}`}
                style={[
                  styles.dot,
                  idx === activeImageIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
          <Text style={styles.brand}>{mainProduct.brand}</Text>
          <Text style={styles.productTitle}>{mainProduct.title}</Text>
          <Text style={styles.productTitle}>{mainProduct.title}</Text>
          <Text style={styles.weight}>{mainProduct.weightLabel}</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{formatPrice(mainProduct.price)}</Text>
              <Text style={styles.oldPrice}>
                {formatPrice(mainProduct.oldPrice)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.optionsButton}
              onPress={() => openOptions(mainProduct.id)}
              activeOpacity={0.85}
            >
              <View style={styles.optionsButtonContent}>
                <Text style={styles.optionsText}>2 options</Text>
                <Image
                  source={require('../assets/images/chevron-down.png')}
                  style={styles.optionsChevron}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Similar products</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {similarProductIds.map(productId => (
              <SimilarProductCard
                key={productId}
                item={productsById[productId]}
                quantity={quantitiesByProductId[productId] ?? 0}
                onOptionsPress={openOptions}
                onAddPress={addToCart}
                onIncrementPress={addToCart}
                onDecrementPress={reduceFromCart}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Customers also bought</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {customerAlsoBoughtIds.map(productId => (
              <SimilarProductCard
                key={`customer-${productId}`}
                item={productsById[productId]}
                quantity={quantitiesByProductId[productId] ?? 0}
                onOptionsPress={openOptions}
                onAddPress={addToCart}
                onIncrementPress={addToCart}
                onDecrementPress={reduceFromCart}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => dispatch(navigateToReviewCart())}
        activeOpacity={0.9}
      >
        <Text style={styles.floatingCartIcon}>🛒</Text>
        {cartCount > 0 && (
          <View style={styles.floatingBadge}>
            <Text style={styles.floatingBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={Boolean(selectedProductId)}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.overlayTouchable} onPress={closeModal} />
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>{selectedProduct?.title}</Text>

            <View style={styles.optionCard}>
              <View style={styles.optionLeft}>
                <View style={styles.optionImageFrame}>
                  <Image
                    source={
                      selectedProduct
                        ? getProductImage(selectedProduct.imageKey)
                        : getProductImage('dairyMilk')
                    }
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                </View>
                {hasOptionOneSelection && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{optionOneQty}</Text>
                  </View>
                )}
                <View style={styles.optionMeta}>
                  <Text style={styles.optionWeightText}>
                    2 X {selectedProduct?.weightLabel}
                  </Text>
                  <View style={styles.optionPriceRow}>
                    <Text style={styles.optionPrice}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.price * 2)
                        : ''}
                    </Text>
                    <Text style={styles.optionOldPrice}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.oldPrice * 2)
                        : ''}
                    </Text>
                  </View>
                </View>
              </View>
              {hasOptionOneSelection ? (
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    onPress={() =>
                      optionOneProductId && reduceFromCart(optionOneProductId)
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.qtyAction}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{optionOneQty}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      optionOneProductId && addToCart(optionOneProductId)
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.qtyAction}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  activeOpacity={0.85}
                  onPress={() =>
                    optionOneProductId && addToCart(optionOneProductId)
                  }
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.optionCard}>
              <View style={styles.optionLeft}>
                <View style={styles.optionImageFrame}>
                  <Image
                    source={
                      selectedProduct
                        ? getProductImage(selectedProduct.imageKey)
                        : getProductImage('dairyMilk')
                    }
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                </View>
                {hasOptionTwoSelection && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{optionTwoQty}</Text>
                  </View>
                )}
                <View style={styles.optionMeta}>
                  <Text style={styles.optionWeightText}>
                    1 X {selectedProduct?.weightLabel}
                  </Text>
                  <View style={styles.optionPriceRow}>
                    <Text style={styles.optionPrice}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.price)
                        : ''}
                    </Text>
                    <Text style={styles.optionOldPrice}>
                      {selectedProduct
                        ? formatPrice(selectedProduct.oldPrice)
                        : ''}
                    </Text>
                  </View>
                </View>
              </View>
              {hasOptionTwoSelection ? (
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    onPress={() =>
                      optionTwoProductId && reduceFromCart(optionTwoProductId)
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.qtyAction}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{optionTwoQty}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      optionTwoProductId && addToCart(optionTwoProductId)
                    }
                    hitSlop={8}
                  >
                    <Text style={styles.qtyAction}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  activeOpacity={0.85}
                  onPress={() =>
                    optionTwoProductId && addToCart(optionTwoProductId)
                  }
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              activeOpacity={0.9}
              onPress={closeModal}
            >
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingHorizontal: 10,
    paddingBottom: 22,
  },
  headerIcon: {
    width: 22,
    height: 22,
  },
  mainProductCard: {
    borderRadius: 14,
    backgroundColor: 'white',
    paddingHorizontal: 9,
    paddingTop: 8,
    paddingBottom: 9,
  },
  badge: {
    width: 40,
    height: 40,
    marginLeft: 2,
  },
  mainImageFrame: {
    alignSelf: 'center',
    width: 108,
    height: 122,
    borderRadius: 9,
    backgroundColor: 'white',
    marginTop: -2,
    overflow: 'hidden',
  },
  mainImageScrollView: {
    width: 108,
    height: 122,
  },
  mainImageCarousel: {
    alignItems: 'center',
    minHeight: 122,
  },
  mainImageSlide: {
    width: 108,
    height: 122,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: 92,
    height: 164,
    marginTop: 6,
  },
  carouselImageCompact: {
    width: 72,
    height: 84,
    marginTop: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginBottom: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#c9c9cb',
  },
  activeDot: {
    backgroundColor: '#f0a43d',
  },
  brand: {
    color: '#919196',
    fontSize: 12.5,
    marginBottom: 2,
    fontFamily: 'Inter-Medium',
  },
  productTitle: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 14.8,
    lineHeight: 20,
    fontFamily: 'Inter-Medium',
  },
  weight: {
    color: '#9e9ea1',
    marginTop: 1,
    marginBottom: 5,
    fontSize: 12.5,
    fontFamily: 'Inter-Medium',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBlock: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
  },
  price: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 22,
    fontFamily: 'Inter-Medium',
  },
  oldPrice: {
    color: COLORS.strike,
    fontSize: 12.5,
    textDecorationLine: 'line-through',
    fontFamily: 'Inter-Medium',
  },
  optionsButton: {
    backgroundColor: COLORS.button,
    borderRadius: 7,
    minWidth: 94,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  optionsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionsText: {
    color: '#f4fbf4',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  optionsChevron: {
    width: 18,
    height: 16,
    tintColor: '#f4fbf4',
    // transform: [{rotate: '180deg'}],
  },
  sectionCard: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: 'white',
    padding: 10,
  },
  sectionTitle: {
    color: '#141517',
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'Inter-Medium',
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: 'Inter-Medium',
  },
  horizontalList: {
    paddingVertical: 4,
    paddingRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 16,
  },
  sheetTitle: {
    color: 'black',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: 'Inter-Medium',
  },
  optionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dddddd',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  optionImageFrame: {
    width: 62,
    height: 62,
    borderRadius: 9,
    backgroundColor: '#efefef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8d8d8',
  },
  optionImage: {
    width: 24,
    height: 45,
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    left: 52,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f59a4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  optionMeta: {
    marginLeft: 10,
    flexShrink: 1,
  },
  optionWeightText: {
    color: '#b0b0b0',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  optionPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    marginTop: 1,
  },
  optionPrice: {
    color: '#1e1f23',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
  optionOldPrice: {
    color: '#b8b8b8',
    fontSize: 10.5,
    textDecorationLine: 'line-through',
    fontFamily: 'Inter-Medium',
  },
  qtyControl: {
    height: 38,
    minWidth: 96,
    borderRadius: 10,
    borderWidth: 1.6,
    borderColor: COLORS.button,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  qtyAction: {
    color: COLORS.button,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  qtyValue: {
    color: '#2b2d31',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  addButton: {
    height: 38,
    minWidth: 96,
    borderRadius: 10,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    color: '#f1f9f1',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  confirmButton: {
    marginTop: 4,
    backgroundColor: COLORS.button,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  confirmText: {
    color: '#f1f9f1',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  floatingCart: {
    position: 'absolute',
    right: 16,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  floatingCartIcon: {
    fontSize: 24,
  },
  floatingBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff7a00',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  floatingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Inter-Medium',
  },
});
