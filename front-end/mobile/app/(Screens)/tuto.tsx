import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#588157',
  primaryLight: '#D1D8C4',
  primaryMedium: '#8DAA85',
  background: '#FFFFFF',
  white: '#FFFFFF',
  black: '#1A1A1A',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  cardBg: '#F0F4EE',
  border: '#D5DED0',
  tagBg: '#E8EEE5',
  emergencyRed: '#D94F4F',
  overlay: 'rgba(0,0,0,0.3)',
};
const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const BORDER_RADIUS = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMG_W = SCREEN_WIDTH * 0.38;

// ─── Back ──────────────────────────────────────────────────────────────────────
const Back = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.backBtn}>
    <Ionicons name="chevron-back" size={20} color="#2d4a2d" />
  </TouchableOpacity>
);

// ─── AnimatedItem ──────────────────────────────────────────────────────────────
type Direction = 'left' | 'right';

interface AnimatedItemProps {
  children: React.ReactNode;
  delay: number;
  direction: Direction;
  visible: boolean;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay, direction, visible }) => {
  const initial = direction === 'right' ? 50 : -50;
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(initial)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 480, delay, useNativeDriver: true }),
        Animated.timing(translateX, { toValue: 0, duration: 480, delay, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
      translateX.setValue(initial);
    }
  }, [visible]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateX }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Universal Row ─────────────────────────────────────────────────────────────
// index % 2 === 0  →  visual LEFT,  text RIGHT   (slides in from right)
// index % 2 === 1  →  text  LEFT,  visual RIGHT  (slides in from left)
interface RowProps {
  index: number;                 // position in the page (0, 1, 2, 3…)
  visual: React.ReactNode;       // image or icon box
  text: string;
  bolds?: string[];
  delay: number;
  visible: boolean;
}

const Row: React.FC<RowProps> = ({ index, visual, text, bolds = [], delay, visible }) => {
  const flip = index % 2 === 1;
  // even row: visual enters from LEFT side → animate from right
  // odd row:  visual enters from RIGHT side → animate from left
  const direction: Direction = flip ? 'left' : 'right';

  const renderText = () => {
    if (bolds.length === 0) return <Text style={styles.rowTitle}>{text}</Text>;
    let remaining = text;
    const nodes: React.ReactNode[] = [];
    let k = 0;
    for (const b of bolds) {
      const idx = remaining.indexOf(b);
      if (idx === -1) continue;
      if (idx > 0) nodes.push(remaining.slice(0, idx));
      nodes.push(<Text key={k++} style={styles.rowBold}>{b}</Text>);
      remaining = remaining.slice(idx + b.length);
    }
    if (remaining) nodes.push(remaining);
    return <Text style={styles.rowTitle}>{nodes}</Text>;
  };

  const visualEl = <View style={styles.visualWrap}>{visual}</View>;
  const textEl   = <View style={styles.rowText}>{renderText()}</View>;

  return (
    <AnimatedItem delay={delay} direction={direction} visible={visible}>
      <View style={styles.row}>
        {flip ? textEl : visualEl}
        {flip ? visualEl : textEl}
      </View>
    </AnimatedItem>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const IconVisual = ({ source, bg }: { source: any; bg?: string }) => (
  <View style={[styles.iconBox, bg ? { backgroundColor: bg } : {}]}>
    <Image source={source} style={styles.iconImg} resizeMode="contain" />
  </View>
);

const ScreenshotVisual = ({ source, ratio }: { source: any; ratio: number }) => (
  <Image
    source={source}
    style={[styles.screenshotImg, { width: IMG_W, height: IMG_W * ratio }]}
    resizeMode="contain"
  />
);

// ─── Page 1 ────────────────────────────────────────────────────────────────────
// index 0 → home icon  LEFT   | text RIGHT
// index 1 → filter img RIGHT  | text LEFT
// index 2 → search icon LEFT  | text RIGHT
// index 3 → navbar icon RIGHT | text LEFT
// index 4 → map icon   LEFT   | text RIGHT
const Page1: React.FC<{ visible: boolean }> = ({ visible }) => (
  <View style={styles.pageContent}>
    <Row index={0} delay={0}   visible={visible}
       visual={<ScreenshotVisual source={require('../../assets/images/home-cptr.png')} ratio={0.5} />}
      text="Discover all the latest donation posts from our community."
      bolds={['donation posts']}
    />
    <Row index={1} delay={150} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/filter-cptr.png')} ratio={0.6} />}
      text="Apply filters to see exactly what matters to you."
      bolds={['matters to you']}
    />
    <Row index={2} delay={300} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/searchBar.png')} ratio={0.3} />}
      text="Quickly find what you're looking for. Search by username or post title."
      bolds={['username or post title']}
    />
    <Row index={3} delay={450} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/navbar.png')} ratio={0.75} />}
      text="Create a new donation post and share it with the community"
      bolds={['new donation post']}
    />
    <Row index={4} delay={600} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/map.png')} ratio={0.5} />}
      text="Explore donation posts pinned at their real locations, on the interactive map."
      bolds={['real locations']}
    />
  </View>
);

// ─── Page 2 ────────────────────────────────────────────────────────────────────
// index 0 → post img   LEFT   | text RIGHT
// index 1 → reserve icon RIGHT| text LEFT
// index 2 → report icon LEFT  | text RIGHT
// index 3 → location icon RIGHT| text LEFT
const Page2: React.FC<{ visible: boolean }> = ({ visible }) => (
  <View style={styles.pageContent}>
    <Row index={0} delay={0}   visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/post-cptr.png')} ratio={1.4} />}
      text="View full information & photos about a specific post"
      bolds={['specific post']}
    />
    <Row index={1} delay={150} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/reserve-btn.png')} ratio={0.3} />}
      text="Reserve the item : Claim it before anyone else"
      bolds={['Claim it']}
    />
    <Row index={2} delay={300} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/report....png')} ratio={0.5} />}
      text="Report: Flag inappropriate or fake posts.                   Not Interested: Hide this post from your feed"
      bolds={['Report', 'Not Interested']}
    />
    <Row index={3} delay={450} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/distance.png')} ratio={0.3} />}
      text="Check the exact location on the map and see the distance from your current position"
      bolds={['exact location', 'distance']}
    />
  </View>
);

// ─── Page 3 ────────────────────────────────────────────────────────────────────
// index 0 → profile img LEFT  | text RIGHT
// index 1 → my-post img RIGHT | text LEFT
// index 2 → chat icon  LEFT   | text RIGHT
// index 3 → bell icon  RIGHT  | text LEFT
const Page3: React.FC<{ visible: boolean }> = ({ visible }) => (
  <View style={styles.pageContent}>
    <Row index={0} delay={0}   visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/profile-cptr.png')} ratio={0.9} />}
      text="See your total donations and score"
      bolds={['donations', 'score']}
    />
    <Row index={1} delay={150} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/my-post.png')} ratio={1} />}
      text="Manage your posts (Active, Expired, Donated) and track reservations & requests"
      bolds={['reservations & requests']}
    />
    <Row index={2} delay={300} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/chat.png')} ratio={0.5} />}
      text="Chat directly with donors and people interested in your posts to arrange donations easily."
      bolds={['Chat directly']}
    />
    <Row index={3} delay={450} visible={visible}
      visual={<ScreenshotVisual source={require('../../assets/images/notification.png')} ratio={0.5} />}
      text="Receive instant alerts about reservations, request updates, and important activity on your posts."
      bolds={['instant alerts']}
    />
  </View>
);

// ─── Dots ──────────────────────────────────────────────────────────────────────
const Dots: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
    ))}
  </View>
);

// ─── Main ──────────────────────────────────────────────────────────────────────
const PAGES = [
  { Component: Page1, label: 'Next' },
  { Component: Page2, label: 'Next' },
  { Component: Page3, label: 'Discover' },
];

export default function TutorialScreen() {
  const [page, setPage]       = useState(0);
  const [visible, setVisible] = useState(true);
  const slideAnim             = useRef(new Animated.Value(0)).current;

  const goBack = () => {
    if (page === 0) return;
    setVisible(false);
    Animated.timing(slideAnim, { toValue: SCREEN_WIDTH, duration: 280, useNativeDriver: true }).start(() => {
      setPage(p => p - 1);
      slideAnim.setValue(-SCREEN_WIDTH);
      setVisible(true);
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    if (page === PAGES.length - 1) {
      router.replace('/(tabs)/HomeScreen');
      return;
    }
    setVisible(false);
    Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 280, useNativeDriver: true }).start(() => {
      setPage(p => p + 1);
      slideAnim.setValue(SCREEN_WIDTH);
      setVisible(true);
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }).start();
    });
  };

  const { Component, label } = PAGES[page];

  return (
    <View style={styles.screen}>
      <Animated.View style={[{ flex: 1 }, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {page > 0 && <Back onPress={goBack} />}
          <Component visible={visible} />
        </ScrollView>
      </Animated.View>

      <View style={styles.footer}>
        <Dots current={page} total={PAGES.length} />
        <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>{label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  pageContent: {
    gap: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  // wraps visual so it doesn't stretch
  visualWrap: {
    flexShrink: 0,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  rowBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImg: {
    width: 46,
    height: 46,
  },
  screenshotImg: {
    borderRadius: BORDER_RADIUS.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 40,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  backBtn: {
    marginLeft: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginBottom: 25,
  },
});