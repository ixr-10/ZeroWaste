import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../constants/axios';

interface AcceptedReservation {
  id: number;
  donation: number;
  donation_title: string;
  donation_image: string | null;
  donor_username: string;
  status: string;
}

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

export default function ReservationAcceptedModal() {
  const router = useRouter();
  const [reservation, setReservation] = useState<AcceptedReservation | null>(null);
  const [visible, setVisible]         = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const check = async () => {
        try {
          const token = await AsyncStorage.getItem('access_token'); // ✅ fixed key
          if (!token) {
            return;
          }

          const res = await api.get('/donations/reservations/my-reservations/');

          const all: AcceptedReservation[] = res.data?.my_requests?.confirmed || [];

          if (all.length === 0) {
            return;
          }

          const shownIds = await getShownIds();

          // Clean up stale shown IDs
          const allIds = all.map((r) => r.id);
          const cleanedShown = shownIds.filter((id: number) => allIds.includes(id));
          if (cleanedShown.length !== shownIds.length) {
            await AsyncStorage.setItem(SHOWN_KEY, JSON.stringify(cleanedShown));
          }

          const unseen = all.find((r) => !cleanedShown.includes(r.id));

          if (unseen) {
            setReservation(unseen);
            setVisible(true);
          }
        } catch (err: any) {
          console.log('[Modal] check failed:', err?.response?.status, err?.message, JSON.stringify(err?.response?.data));
        }
      };

      check();
    }, [])
  );

  const handleCancel = async () => {
    if (reservation) await markShown(reservation.id);
    setVisible(false);
  };

  const handleStartConversation = async () => {
    if (!reservation) return;
    setChatLoading(true);
    try {
      const res = await api.get('/chat/my-conversations/');
      const conversations: any[] = res.data || [];

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
      console.log('[Modal] start conversation failed:', err);
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
      <Pressable style={styles.backdrop} onPress={handleCancel} />
      <View style={styles.centerer}>
        <View style={styles.card}>
          <Text style={styles.title}>Your reservation for</Text>
          <View style={styles.imageWrapper}>
            {reservation.donation_image ? (
              <Image source={{ uri: reservation.donation_image }} style={styles.foodImage} />
            ) : (
              <View style={[styles.foodImage, styles.imageFallback]} />
            )}
          </View>
          <Text style={styles.foodName}>{reservation.donation_title}</Text>
          <Text style={styles.description}>
            was accepted by{' '}
            <Text style={styles.highlightedUsername}>{reservation.donor_username}</Text>
            {', '}start chatting to get{'\n'}more details
          </Text>
        </View>

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

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  centerer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#E8EDE5', borderRadius: 24, paddingVertical: 36, paddingHorizontal: 28, width: '100%', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  title: { fontSize: 22, fontWeight: '600', color: '#1A1A1A', textAlign: 'center', marginBottom: 24, letterSpacing: 0.2 },
  imageWrapper: { marginBottom: 16, borderRadius: 18, overflow: 'hidden', elevation: 4 },
  foodImage: { width: 150, height: 150, borderRadius: 18 },
  imageFallback: { backgroundColor: '#D5DED0' },
  foodName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 },
  description: { fontSize: 15, color: '#444', textAlign: 'center', lineHeight: 24, paddingHorizontal: 8 },
  highlightedUsername: { fontWeight: '700', color: '#4A6741' },
  startBtn: { backgroundColor: '#4A6741', borderRadius: 14, paddingVertical: 16, width: '100%', alignItems: 'center', marginBottom: 12, elevation: 4 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  cancelBtn: { borderRadius: 14, paddingVertical: 15, width: '100%', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#D5DED0' },
  cancelBtnText: { color: '#888', fontSize: 15, fontWeight: '600' },
});
