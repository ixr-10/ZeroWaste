import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../constants/axios';

const COLORS = {
  primary: '#4A6741',
  background: '#F8F8F6',
  sectionBg: '#E8EDE5',
  cardBg: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  border: '#D5DED0',
  star: '#E8B84B',
  starEmpty: '#D5DED0',
  error: '#D94F4F',
  terrible: '#D94F4F',
  bad: '#E07B39',
  okay: '#E8B84B',
  good: '#7A9B71',
  excellent: '#4A6741',
};

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Terrible',  color: COLORS.terrible },
  2: { label: 'Bad',       color: COLORS.bad },
  3: { label: 'Okay',      color: COLORS.okay },
  4: { label: 'Good',      color: COLORS.good },
  5: { label: 'Excellent', color: COLORS.excellent },
};

export default function RateExperienceScreen() {
  const router = useRouter();
  const {
    reservationId: initialReservationId,
    conversationId,
    donorName,
    donorAvatar,
  } = useLocalSearchParams<{
    reservationId?: string;
    conversationId?: string;
    donorName?: string;
    donorAvatar?: string;
  }>();

  const [reservationId, setReservationId] = useState<string | null>(initialReservationId || null);
  const [selectedStar, setSelectedStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fetching, setFetching] = useState(!initialReservationId && !!conversationId);

  // Fetch reservationId if only conversationId is passed
  useEffect(() => {
    const fetchReservation = async () => {
      if (initialReservationId || !conversationId) {
        setFetching(false);
        return;
      }

      try {
        const res = await api.get(`donations/reservations/by-conversation/${conversationId}/`);
        setReservationId(String(res.data.id));
      } catch (err: any) {
        setError("No reservation found for this conversation yet.");
      } finally {
        setFetching(false);
      }
    };

    fetchReservation();
  }, [conversationId, initialReservationId]);

  const markAsRated = async () => {
    if (reservationId) {
      await AsyncStorage.setItem(`rated_reservation_${reservationId}`, 'true');
    }
  };

  const handleSubmit = async () => {
    if (selectedStar === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!reservationId) {
      setError('Reservation ID is missing. Please try again later.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post(`/donations/reservations/${reservationId}/rate/`, {
        score: selectedStar,
      });

      await markAsRated();
      setSuccess(true);
      setTimeout(() => router.back(), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit rating. Please try again.';

      if (msg.includes('already rated') || msg === 'You have already rated this reservation.') {
        await markAsRated();
        setSuccess(true);
        setTimeout(() => router.back(), 1500);
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 12, color: COLORS.textMuted }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate The Experience</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.outerCard}>

          {/* User card */}
          <View style={styles.userCard}>
            <View style={styles.avatarCircle}>
              {donorAvatar ? (
                <Image source={{ uri: donorAvatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={28} color={COLORS.primary} />
              )}
            </View>
            <Text style={styles.userName}>{donorName || 'Username'}</Text>
          </View>

          {/* Rating card */}
          <View style={styles.ratingCard}>
            <Text style={styles.ratingQuestion}>How was your experience?</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedStar(star)}
                  activeOpacity={0.7}
                  style={styles.starBtn}
                >
                  <Ionicons
                    name={star <= selectedStar ? 'star' : 'star-outline'}
                    size={44}
                    color={star <= selectedStar ? COLORS.star : COLORS.starEmpty}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {selectedStar > 0 && (
              <Text style={[styles.ratingLabel, { color: RATING_LABELS[selectedStar].color }]}>
                {RATING_LABELS[selectedStar].label}
              </Text>
            )}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {success ? (
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.successText}>Rating submitted!</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (selectedStar === 0 || loading) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={selectedStar === 0 || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit Rating</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: COLORS.sectionBg,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  content: { flex: 1, padding: 16, gap: 12 },

  outerCard: {
    backgroundColor: COLORS.sectionBg,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },

  userCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8EEE5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatarImage: { width: '100%', height: '100%' },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },

  ratingCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  ratingQuestion: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: { padding: 4 },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  errorText: {
    fontSize: 13,
    color: COLORS.error,
    textAlign: 'center',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.border,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});