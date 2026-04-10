import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { useAppDispatch } from '../hooks/redux';
import { navigateToProduct } from '../redux/uiSlice';

function OrderRouteMap() {
  return (
    <View style={styles.mapCard}>
      <Text style={styles.mapTitle}>Delivery route</Text>
      <View style={styles.mapFrame}>
        <View style={styles.mapSurface}>
          <View style={[styles.mapPatch, styles.patch1]} />
          <View style={[styles.mapPatch, styles.patch2]} />
          <View style={[styles.mapPatch, styles.patch3]} />
          <View style={[styles.road, styles.road1]} />
          <View style={[styles.road, styles.road2]} />
          <View style={[styles.road, styles.road3]} />
          <View style={styles.routeSegmentA} />
          <View style={styles.routeSegmentB} />
          <View style={[styles.markerCluster, styles.markerStore]}>
            <View style={styles.markerBubbleStore}>
              <Image
                source={require('../assets/images/location-pin.png')}
                style={styles.markerPinImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.markerLabel}>Store</Text>
          </View>
          <View style={[styles.markerCluster, styles.markerHome]}>
            <View style={styles.markerBubbleHome}>
              <Image
                source={require('../assets/images/location-pin.png')}
                style={styles.markerPinImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.markerLabel}>Your home</Text>
          </View>
        </View>
      </View>
      <Text style={styles.mapFootnote}>
        Rider will follow this route · Live tracking coming soon
      </Text>
    </View>
  );
}

export function OrderSuccessScreen() {
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
        <Text style={styles.title}>Payment successful</Text>
        <Text style={styles.subtitle}>
          Thank you for your order. Your groceries are being packed and will be
          on the way soon.
        </Text>

        <OrderRouteMap />

        <View style={styles.deliveryCard}>
          <Text style={styles.deliveryLabel}>Estimated delivery</Text>
          <Text style={styles.deliveryTime}>30 – 60 minutes</Text>
          <Text style={styles.deliveryHint}>
            We&apos;ll notify you when your order is out for delivery.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.9}
          onPress={() => dispatch(navigateToProduct())}
        >
          <Text style={styles.primaryButtonText}>Continue shopping</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 28,
    alignItems: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  checkMark: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '700',
    marginTop: -4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#5c5c5c',
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  mapCard: {
    width: '100%',
    marginBottom: 22,
  },
  mapTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'Inter-Medium',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  mapFrame: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dce6e2',
    backgroundColor: '#cfd9d4',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  mapSurface: {
    height: 220,
    width: '100%',
    backgroundColor: '#d8e6df',
    position: 'relative',
  },
  mapPatch: {
    position: 'absolute',
    borderRadius: 6,
    opacity: 0.45,
  },
  patch1: {
    width: 72,
    height: 48,
    backgroundColor: '#b8d4c4',
    top: 24,
    left: 16,
  },
  patch2: {
    width: 56,
    height: 64,
    backgroundColor: '#a8c9b8',
    top: 100,
    right: 28,
  },
  patch3: {
    width: 88,
    height: 36,
    backgroundColor: '#c0d8cc',
    bottom: 20,
    left: '38%',
  },
  road: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  road1: {
    width: '100%',
    height: 10,
    top: '42%',
    left: 0,
  },
  road2: {
    width: 12,
    height: '100%',
    top: 0,
    left: '55%',
  },
  road3: {
    width: '70%',
    height: 8,
    bottom: 32,
    right: 0,
    transform: [{ rotate: '-8deg' }],
  },
  routeSegmentA: {
    position: 'absolute',
    width: 118,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.button,
    top: '28%',
    left: '52%',
    transform: [{ rotate: '118deg' }],
    opacity: 0.95,
  },
  routeSegmentB: {
    position: 'absolute',
    width: 96,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.button,
    top: '48%',
    left: '28%',
    transform: [{ rotate: '38deg' }],
    opacity: 0.95,
  },
  markerCluster: {
    position: 'absolute',
    alignItems: 'center',
  },
  markerStore: {
    top: '8%',
    right: '12%',
  },
  markerHome: {
    bottom: '10%',
    left: '10%',
  },
  markerBubbleStore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f7b94',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerBubbleHome: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  markerPinImg: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  markerLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#2a2a2a',
    fontFamily: 'Inter-Medium',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  mapFootnote: {
    marginTop: 10,
    fontSize: 12,
    color: '#7a7a7a',
    fontFamily: 'Inter-Medium',
    alignSelf: 'flex-start',
  },
  deliveryCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  deliveryLabel: {
    fontSize: 13,
    color: '#8a8a8a',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  deliveryTime: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f7b94',
    fontFamily: 'Inter-Medium',
    marginBottom: 10,
  },
  deliveryHint: {
    fontSize: 13,
    lineHeight: 19,
    color: '#7a7a7a',
    fontFamily: 'Inter-Medium',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: COLORS.button,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#f8fff8',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
});
