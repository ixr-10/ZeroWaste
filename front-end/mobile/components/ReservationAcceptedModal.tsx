import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../constants/axios';   // adjust path if needed

// ─── Type — matches ReservationSerializer exactly ────────────────────────────
interface AcceptedReservation {
  id: number;
  donation: number;           // donation ID
  donation_title: string;
  donation_image: string | null;
  donor_username: string;
  status: string;
}

// ─── AsyncStorage key — prevents showing same popup twice ────────────────────
const SHOWN_KEY = 'shown_reservation_popups';

const getShownIds = async (): Promise<number[]> => {
  try {
    const raw = await AsyncStorage.getItem(SHOWN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const markShown = async (id: number) => {
  const existing = await getShownIds();
  if (!existing.includes(id)) {
    await AsyncStorage.setItem(SHOWN_KEY, JSON.stringify([...existing, id]));
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ReservationAcceptedModal() {
  const router = useRouter();

  const [reservation, setReservation] = useState<AcceptedReservation | null>(null);
  const [visible, setVisible]         = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // ── Check for newly confirmed reservations on mount ───────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        // Only run if user is logged in
        const token = await AsyncStorage.getItem('access');
        if (!token) return;

        const res = await api.get('/donations/reservations/my-reservations/');
        const all: AcceptedReservation[] = res.data || [];

        // Filter for confirmed only
        const confirmed = all.filter((r) => r.status === 'confirmed');
        if (confirmed.length === 0) return;

        // Find first one the user hasn't seen yet
        const shownIds = await getShownIds();
        const unseen = confirmed.find((r) => !shownIds.includes(r.id));

        if (unseen) {
          setReservation(unseen);
          setVisible(true);
        }
      } catch (err) {
        // Silent — never block the app
        console.log('[ReservationAcceptedModal] check failed:', err);
      }
    };

    check();
  }, []);

  // ── Dismiss ───────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (reservation) await markShown(reservation.id);
    setVisible(false);
  };

  // ── Start chat ────────────────────────────────────────────────────────────
  // The conversation already exists (created in ReserveDonationView).
  // We fetch it from /chat/my-conversations/ and find the one for this donation.
  const handleStartConversation = async () => {
    if (!reservation) return;
    setChatLoading(true);
    try {
      // Fetch existing conversations
      const res = await api.get('/chat/my-conversations/');
      const conversations: any[] = res.data || [];

      // Find the conversation that belongs to this donation
      const convo = conversations.find(
        (c: any) => c.donation === reservation.donation || c.donation_id === reservation.donation
      );

      await markShown(reservation.id);
      setVisible(false);

      if (convo) {
        router.push({
          pathname: '/(Screens)/ChatConversation',
          params: {
            conversationId: String(convo.id),
            donorUsername: reservation.donor_username,
          },
        });
      } else {
        // Fallback: start a new conversation (shouldn't normally happen)
        const startRes = await api.post(`/chat/start/${reservation.donation}/`);
        router.push({
          pathname: '/(Screens)/ChatConversation',
          params: {
            conversationId: String(startRes.data?.id ?? startRes.data?.conversation_id),
            donorUsername: reservation.donor_username,
          },
        });
      }
    } catch (err) {
      console.log('[ReservationAcceptedModal] start conversation failed:', err);
    } finally {
      setChatLoading(false);
    }
  };

  if (!visible || !reservation) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      {/* Dimmed backdrop — tapping it dismisses */}
      <Pressable style={styles.backdrop} onPress={handleCancel} />

      <View style={styles.centerer}>
        {/* ── Card ── */}
        <View style={styles.card}>
          <Text style={styles.title}>Your reservation for</Text>

          {/* Food image */}
          <View style={styles.imageWrapper}>
            {reservation.donation_image ? (
              <Image
                source={{ uri: reservation.donation_image }}
                style={styles.foodImage}
              />
            ) : (
              <View style={[styles.foodImage, styles.imageFallback]} />
            )}
          </View>

          {/* Food name */}
          <Text style={styles.foodName}>{reservation.donation_title}</Text>

          {/* Message */}
          <Text style={styles.description}>
            was accepted by{' '}
            <Text style={styles.highlightedUsername}>{reservation.donor_username}</Text>
            {', '}start chatting to get{'\n'}more details
          </Text>
        </View>

        {/* ── Buttons ── */}
        <TouchableOpacity
          style={[styles.startBtn, chatLoading && { opacity: 0.7 }]}
          onPress={handleStartConversation}
          activeOpacity={0.85}
          disabled={chatLoading}
        >
          {chatLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startBtnText}>Start Conversation</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  centerer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  card: {
    backgroundColor: '#E8EDE5',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.2,
  },

  imageWrapper: {
    marginBottom: 16,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  foodImage: {
    width: 150,
    height: 150,
    borderRadius: 18,
  },
  imageFallback: {
    backgroundColor: '#D5DED0',
  },

  foodName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },

  description: {
    fontSize: 15,
    color: '#444',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  highlightedUsername: {
    fontWeight: '700',
    color: '#4A6741',
  },

  startBtn: {
    backgroundColor: '#4A6741',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4A6741',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D5DED0',
  },
  cancelBtnText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
});