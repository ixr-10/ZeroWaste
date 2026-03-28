import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ImageBackground,
  StatusBar,
  SafeAreaView,
  ViewToken,
} from 'react-native';
import { useFonts, Outfit_400Regular, Outfit_700Bold, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    image: require('../../assets/images/onboarding1.png'),
    text: 'Join a community where no good food ever goes to waste.',
  },
  {
    id: '2',
    image: require('../../assets/images/onboarding2.png'),
    text: 'Good food, zero cost — because everyone deserves a full plate.',
  },
  {
    id: '3',
    image: require('../../assets/images/onboarding3.png'),
    text: 'Small acts of giving create big waves of change.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(tabs)/slides');
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      await finishOnboarding();
    }
  };

  const handleSkip = () => {
    const lastIndex = SLIDES.length - 1;
    flatListRef.current?.scrollToIndex({ index: lastIndex, animated: true });
    setCurrentIndex(lastIndex);
  };

  if (!fontsLoaded) return null;

 const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
  <View style={styles.slide}>
    <ImageBackground
      source={item.image}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Gradient overlay inside the ImageBackground */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)']}
        style={StyleSheet.absoluteFillObject}
      />
    </ImageBackground>
  </View>
);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFillObject}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={0}
        scrollEnabled={true}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.65)']}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.uiLayer} pointerEvents="box-none">

        {/* Skip Button — hidden on last slide */}
        {!isLastSlide && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip▶</Text>
          </TouchableOpacity>
        )}
        {isLastSlide && <View style={styles.skipButton} />}

        <View style={styles.bottomContent}>
          <Text style={styles.tagline}>{SLIDES[currentIndex].text}</Text>

          <View style={styles.dotsContainer}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <View style={styles.nextButtonRow}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {isLastSlide ? 'Discover' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    width: width,
    height: height,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  uiLayer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  skipButton: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    color: '#F5F5F5',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  bottomContent: {
    paddingHorizontal: 28,
    paddingBottom: 36,
    alignItems: 'center',
  },
  tagline: {
    color: '#F5F5F5',
    fontFamily: 'Outfit_700Bold',
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 28,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  dot: {
    borderRadius: 50,
  },
  dotActive: {
    width: 10,
    height: 10,
    backgroundColor: '#F5F5F5',
  },
  dotInactive: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(245,245,245,0.45)',
  },
  nextButtonRow: {
    width: '100%',
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#588157',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  nextButtonText: {
    color: '#F5F5F5',
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 17,
    letterSpacing: 0.3,
  },
});
