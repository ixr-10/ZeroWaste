import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDonationStore } from '../../store/useDonationStore';

const CATEGORIES = [
  { id: "fruits", label: "Fruit & Vegetables", image: require("../../assets/images/fruits.png"), imageStyle: { width: 20, height: 20 } },
  { id: "pastries", label: "Pastries", image: require("../../assets/images/pastries.png"), imageStyle: { width: 25, height: 25 } },
  { id: "produits_laitiers", label: "Milk Products", image: require("../../assets/images/milk.png"), imageStyle: { width: 20, height: 20 } },
  { id: "meat", label: "Meat & Fish", image: require("../../assets/images/meat.png"), imageStyle: { width: 20, height: 20 } },
  { id: "conserves", label: "Preserved Food", image: require("../../assets/images/preserved food.png"), imageStyle: { width: 20, height: 20 } },
  { id: "autre", label: "Cooked Meals", image: require("../../assets/images/cooked meals.png"), imageStyle: { width: 22, height: 22 } },
  { id: "drinks", label: "Drinks", image: require("../../assets/images/drinks.png"), imageStyle: { width: 20, height: 20 } },
  { id: "other", label: "Other (specify)", image: require("../../assets/images/other.png"), imageStyle: { width: 20, height: 20 } },
];

export default function Details() {
  const router = useRouter();
  const { category, description, setCategory, setDescription } = useDonationStore();
  const [selected, setSelected] = useState<string | null>(category);
  const [desc, setDesc] = useState(description);

  const toggle = (id: string) => {
    setSelected(id);
    setCategory(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#2d4a2d" />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>2/4</Text>
        <Text style={styles.stepTitle}>Details</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "50%" }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image style={{ width: 70, height: 70, marginBottom: 4 }} source={require('../../assets/images/pin.png')} />
        <Text style={styles.title}>Category & Description</Text>
        <Text style={styles.subtitle}>Help beneficiaries find what they need.</Text>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={[styles.catCard, selected === cat.id && styles.catCardSelected]} onPress={() => toggle(cat.id)}>
              <Image source={cat.image} style={[styles.catImage, cat.imageStyle]} />
              <Text style={[styles.catLabel, selected === cat.id && styles.catLabelSelected]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>
          Description {selected === "other" ? <Text style={{ color: "red" }}>*</Text> : "(optional)"}
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g: garden tomatoes, unsliced country bread..."
          placeholderTextColor="#aac0aa"
          multiline
          numberOfLines={4}
          value={desc}
          onChangeText={(text) => { setDesc(text); setDescription(text); }}
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, (!selected || (selected === "other" && !desc.trim())) && styles.continueBtnDisabled]}
          onPress={() => {
            if (!selected) { alert('Please select a category'); return; }
            if (selected === "other" && !desc.trim()) return;
            router.push("/Quantity" as any);
          }}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  header: { paddingTop: 2, backgroundColor: 'white' },
  backBtn: { marginLeft: 15, marginTop: 5, width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 2 },
  stepLabel: { fontSize: 16, color: "#7a9e7a", fontWeight: "600", textAlign: 'center' },
  stepTitle: { fontSize: 16, fontWeight: "700", color: "#1a3320", marginTop: 2, marginBottom: 8, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: "rgba(217, 217, 217, 1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingBottom: 24, backgroundColor: "rgba(209, 216, 196, 0.5)", marginBottom: 10, minHeight: '100%' },
  title: { fontSize: 22, fontWeight: "800", color: "#1a3320", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#5a7a5a", lineHeight: 20, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  catCard: { width: "47%", backgroundColor: "#fff", borderRadius: 20, paddingVertical: 12, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: "transparent", elevation: 1 },
  catCardSelected: { borderColor: "#3d6b3d", backgroundColor: "#e8f3e8" },
  catLabel: { fontSize: 11, color: "#3a5a3a", fontWeight: "500", flexShrink: 1 },
  catLabelSelected: { color: "#1a3320", fontWeight: "700" },
  catImage: { resizeMode: "contain" },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#1a3320", marginBottom: 8 },
  textArea: { backgroundColor: "#fff", borderRadius: 20, padding: 14, fontSize: 12, color: "#1a3320", minHeight: 60, borderWidth: 1, borderColor: "#d4e4d4" },
  footer: { paddingHorizontal: 24, paddingBottom: 70,paddingTop: 10, gap: 10, backgroundColor: 'white', marginTop: 20 },
  continueBtn: { backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 25, paddingVertical: 16, alignItems: "center" },
  continueBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  continueBtnDisabled: { backgroundColor: "rgba(88, 129, 87, 0.4)" },
});