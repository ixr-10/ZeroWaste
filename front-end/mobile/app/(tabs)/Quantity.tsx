import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDonationStore } from '../../store/useDonationStore';

const UNITS = ["Kg", "g", "L", "Pieces"];

type EmergencyColor = 'green' | 'orange' | 'red';

const COLOR_OPTIONS: { key: EmergencyColor; color: string; label: string }[] = [
  { key: 'green',  color: '#4A6741', label: 'Low'    },
  { key: 'orange', color: '#E07B39', label: 'Medium' },
  { key: 'red',    color: '#D94F4F', label: 'High'   },
];

export default function Quantity() {
  const router = useRouter();
  const {
    quantity, unit, expiryDate, emergencyColor,
    setQuantity, setUnit, setExpiryDate, setEmergencyColor,
  } = useDonationStore();

  const [localQuantity, setLocalQuantity]     = useState(quantity);
  const [selectedUnit, setSelectedUnit]       = useState(unit);
  const [expiration, setExpiration]           = useState(expiryDate);
  const [selectedColor, setSelectedColor]     = useState<EmergencyColor>(emergencyColor || 'green');
  const [showPicker, setShowPicker]           = useState(false);
  const [date, setDate]                       = useState(new Date());

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#2d4a2d" />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>3/4</Text>
        <Text style={styles.stepTitle}>Date & Quantity</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "75%" }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image style={{ width: 40, height: 40, marginBottom: 4 }} source={require('../../assets/images/mizan.png')} />
        <Text style={styles.title}>Quantity & Expiration</Text>
        <Text style={styles.subtitle}>Indicate the available quantity and the deadline.</Text>

        {/* ── Available Quantity ── */}
        <Text style={styles.sectionLabel}>Available Quantity</Text>
        <View style={styles.quantityRow}>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => { const q = Math.max(1, localQuantity - 1); setLocalQuantity(q); setQuantity(q); }}
            >
              <Ionicons name="remove-sharp" size={20} color="rgba(88, 129, 87, 1)" />
            </TouchableOpacity>
            <TextInput
              style={styles.stepperValue}
              value={String(localQuantity)}
              onChangeText={(val) => {
                const num = parseInt(val);
                if (!isNaN(num) && num > 0) { setLocalQuantity(num); setQuantity(num); }
              }}
              keyboardType="numeric"
              textAlign="center"
            />
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => { const q = localQuantity + 1; setLocalQuantity(q); setQuantity(q); }}
            >
              <Ionicons name="add-sharp" size={20} color="rgba(88, 129, 87, 1)" />
            </TouchableOpacity>
          </View>

          <View style={styles.unitRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, selectedUnit === u && styles.unitBtnSelected]}
                onPress={() => { setSelectedUnit(u); setUnit(u); }}
              >
                <Text style={[styles.unitText, selectedUnit === u && styles.unitTextSelected]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Expiration Date ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Expiration date</Text>
        <TouchableOpacity style={styles.dateInputWrapper} onPress={() => setShowPicker(true)}>
          <TextInput
            style={styles.dateInput}
            placeholder="dd/mm/yyyy"
            placeholderTextColor="#aac0aa"
            value={expiration}
            editable={false}
            pointerEvents="none"
          />
          <Ionicons name="calendar-outline" size={20} color="black" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event: any, selectedDate: Date | undefined) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                const day   = String(selectedDate.getDate()).padStart(2, '0');
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const year  = selectedDate.getFullYear();
                const formatted = `${day}/${month}/${year}`;
                setExpiration(formatted);
                setExpiryDate(formatted);
              }
            }}
          />
        )}

        {/* ── Emergency Color ── */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Emergency Color</Text>
        <View style={styles.colorRow}>
          {COLOR_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.colorBtn,
                selectedColor === opt.key && styles.colorBtnActive,
              ]}
              onPress={() => {
                setSelectedColor(opt.key);
                setEmergencyColor(opt.key);
              }}
              activeOpacity={0.8}
            >
              {/* Pin icon */}
              <View style={[styles.pinHead, { borderColor: opt.color }]}>
                <View style={[styles.pinDot, { backgroundColor: opt.color }]} />
              </View>
              <View style={[styles.pinStick, { backgroundColor: opt.color }]} />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !expiration && styles.continueBtnDisabled]}
          onPress={() => {
            if (!expiration) { alert('Please select an expiry date'); return; }
            router.push("/Localization" as any);
          }}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: "white" },
  header:       { paddingTop: 2 },
  backBtn:      { marginLeft: 15, marginTop: 5, width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 2 },
  stepLabel:    { fontSize: 16, color: "#7a9e7a", fontWeight: "600", textAlign: 'center' },
  stepTitle:    { fontSize: 16, fontWeight: "700", color: "#1a3320", marginTop: 2, marginBottom: 8, textAlign: 'center' },
  progressBar:  { height: 4, backgroundColor: "rgba(217, 217, 217, 1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 2 },
  content:      { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 165, marginTop: 0, backgroundColor: 'rgb(209, 216, 196, 0.5)' },
  title:        { fontSize: 22, fontWeight: "800", color: "#1a3320", marginBottom: 8 },
  subtitle:     { fontSize: 14, color: "#5a7a5a", lineHeight: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#1a3320", marginBottom: 5 },

  // Quantity
  quantityRow:  { gap: 12, flexDirection: 'column', alignItems: "center", width: '100%' },
  stepper:      { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "transparent", overflow: "hidden" },
  stepperBtn:   { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(217, 224, 201, 1)", borderRadius: 10 },
  stepperValue: { width: 48, textAlign: "center", fontSize: 20, fontWeight: "700", color: "#1a3320" },
  unitRow:      { flexDirection: "row", gap: 5, alignItems: 'center' },
  unitBtn:      { height: 40, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "white", paddingVertical: 9 },
  unitBtnSelected:   { backgroundColor: "#2d5a2d", borderColor: "#2d5a2d" },
  unitText:          { fontSize: 13, color: "black", fontWeight: "500", textAlign: 'center' },
  unitTextSelected:  { color: "#fff", fontWeight: "700" },

  // Date
  dateInputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#d4e4d4", paddingHorizontal: 14 },
  dateInput:        { flex: 1, height: 48, fontSize: 14, color: "#1a3320" },

  // Emergency Color picker
  colorRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  colorBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D5DED0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorBtnActive: {
    backgroundColor: 'rgba(217, 224, 201, 1)',
    borderColor: 'rgba(88, 129, 87, 1)',
  },
  pinHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pinStick: {
    width: 3,
    height: 10,
    borderRadius: 2,
  },

  // Footer
  footer:              { paddingHorizontal: 24, paddingBottom: 70, paddingTop: 10, gap: 10, backgroundColor: "white", marginTop: 20 },
  continueBtn:         { backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 25, paddingVertical: 16, alignItems: "center" },
  continueBtnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
  continueBtnDisabled: { backgroundColor: "rgba(88, 129, 87, 0.4)" },
});