import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

export default function Step4Localization() {
  const router = useRouter();
  const [marker, setMarker] = useState({ latitude: 35.6971, longitude: -0.6308 });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"exact" | "shared">("exact");
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    setLoading(true);
    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;
    setMarker({ latitude, longitude });
    const result = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (result[0]) {
      setAddress(`${result[0].street ?? ""}, ${result[0].city ?? ""}`);
    }
    setLoading(false);
  };

const searchAddress = async (text: string) => {
    if (text.length < 2) { setSuggestions([]); return; }
    try {
      const res = await axios.get(
        `https://api.mapbox.com/search/searchbox/v1/suggest`,
        {
          params: {
            q: text,
            access_token: "pk.eyJ1IjoiYmVuZGFsaSIsImEiOiJjbW5haTcxOGwwaDcyMzJxd3ZwcnU0ZnQxIn0.0aPD9u57r-PMElca5MEG-w",
            session_token: "zerowaste-session",
            limit: 6,
            language: "en",
            proximity: `${marker.longitude},${marker.latitude}`,
          },
        }
      );
      setSuggestions(res.data.suggestions || []);
    } catch (e) {
      setSuggestions([]);
    }
  };
  const selectSuggestion = async (item: any) => {
    try {
      const res = await axios.get(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${item.mapbox_id}`,
        {
          params: {
            access_token: "pk.eyJ1IjoiYmVuZGFsaSIsImEiOiJjbW5haTcxOGwwaDcyMzJxd3ZwcnU0ZnQxIn0.0aPD9u57r-PMElca5MEG-w",
            session_token: "zerowaste-session",
          },
        }
      );
      const feature = res.data.features[0];
      const [lng, lat] = feature.geometry.coordinates;
      setMarker({ latitude: lat, longitude: lng });
      setAddress(item.name + ", " + item.place_formatted);
      setSuggestions([]);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4ef" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#2d4a2d" />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>4/4</Text>
        <Text style={styles.stepTitle}>Localisation</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image style={{ width: 40, height: 40, marginBottom: 4 }} source={require('../assets/images/location.png')} />
        <Text style={styles.title}>Meeting point</Text>
        <Text style={styles.subtitle}>Choose how you want to share your location.</Text>

        <View style={styles.modeToggle}>
          <TouchableOpacity style={[styles.modeBtn, mode === "exact" && styles.modeBtnActive]} onPress={() => setMode("exact")}>
            <Text style={[styles.modeBtnText, mode === "exact" && styles.modeBtnTextActive]}>Exact address</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, mode === "shared" && styles.modeBtnActive]} onPress={() => setMode("shared")}>
            <Text style={[styles.modeBtnText, mode === "shared" && styles.modeBtnTextActive]}>Shared space</Text>
          </TouchableOpacity>
        </View>

        {mode === "exact" ? (
          <View style={{ zIndex: 999 }}>
            <Text style={styles.sectionLabel}>Address</Text>
            <View style={{ zIndex: 999 }}>
              <View style={styles.addressRow}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Search address..."
                  placeholderTextColor="#aac0aa"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    searchAddress(text);
                  }}
                />
                <TouchableOpacity style={styles.locateBtn} onPress={getCurrentLocation}>
                  {loading
                    ? <ActivityIndicator size="small" color="#2d5a2d" />
                    : <Ionicons name="locate-outline" size={18} color="#2d5a2d" />
                  }
                </TouchableOpacity>
              </View>

              {suggestions.length > 0 && (
                <View style={styles.suggestionsList}>
                  {suggestions.map((item: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionRow}
                      onPress={() => selectSuggestion(item)}
                    >
                      <View style={styles.suggestionIcon}>
                        <Ionicons name="location-outline" size={16} color="#588157" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.suggestionSubtext} numberOfLines={1}>{item.place_formatted}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <MapView
              style={styles.map}
              region={{
                latitude: marker.latitude,
                longitude: marker.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setMarker({ latitude, longitude });
                setSuggestions([]);
                // reverse geocode to fill the address input
                const result = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (result[0]) {
                  setAddress(`${result[0].street ?? ""}, ${result[0].city ?? ""}`);
                }
              }}
            >
              <Marker coordinate={marker} draggable onDragEnd={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setMarker({ latitude, longitude });
                const result = await Location.reverseGeocodeAsync({ latitude, longitude });
                if (result[0]) {
                  setAddress(`${result[0].street ?? ""}, ${result[0].city ?? ""}`);
                }
              }} />
            </MapView>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>Enter a public area</Text>
            <TextInput
              style={styles.publicInput}
              placeholder="e.g. City park, Central library..."
              placeholderTextColor="#aac0aa"
            />
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.publishBtn}>
          <Text style={styles.publishBtnText}>Publish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  header: { paddingTop: 2 },
  backBtn: { marginLeft: 15, marginTop: 5, width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 2 },
  stepLabel: { fontSize: 12, color: "#7a9e7a", fontWeight: "600", textAlign: 'center' },
  stepTitle: { fontSize: 18, fontWeight: "700", color: "#1a3320", marginTop: 2, marginBottom: 13, textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: "rgba(217, 217, 217, 1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 2 },
  content: { paddingHorizontal: 24, paddingTop: 28, marginTop: 0, backgroundColor: 'rgba(209, 216, 196, 0.5)', paddingBottom: 20, minHeight: '100%' },
  title: { fontSize: 22, fontWeight: "800", color: "#1a3320", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#5a7a5a", lineHeight: 20, marginBottom: 20 },
  modeToggle: { flexDirection: "row", backgroundColor: "#e2ece2", borderRadius: 10, padding: 4, marginBottom: 20, gap: 12 },
  modeBtn: { flex: 1, paddingVertical: 8, borderRadius: 15, alignItems: "center", borderWidth: 1, borderColor: "rgba(162, 159, 159, 1)", backgroundColor: "white" },
  modeBtnActive: { backgroundColor: "rgba(217, 224, 201, 1)", elevation: 2, borderWidth: 1, borderColor: "rgba(88, 129, 87, 1)" },
  modeBtnText: { fontSize: 13, color: "rgba(162, 159, 159, 1)", fontWeight: "400" },
  modeBtnTextActive: { color: "rgba(88, 129, 87, 1)", fontWeight: "400" },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#1a3320", marginBottom: 8 },
  locateBtn: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#e8f3e8", alignItems: "center", justifyContent: "center", marginRight: 8, alignSelf: "center" },
  map: { height: 180, borderRadius: 14, overflow: "hidden" },
  footer: { paddingHorizontal: 24, paddingBottom: 10, gap: 10, backgroundColor: "white", marginTop: 20 },
  publishBtn: { backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 25, paddingVertical: 16, alignItems: "center" },
  publishBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  publicInput: { backgroundColor: "#fff", borderRadius: 10, padding: 14, fontSize: 14, color: "#1a3320", borderWidth: 1, borderColor: "rgba(88, 129, 87, 1)" },
  autocompleteWrapper: { marginBottom: 16, zIndex: 999 },
  autocompleteInput: { backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "rgba(88, 129, 87, 1)", fontSize: 14, color: "#1a3320", paddingRight: 8 },
  autocompleteList: { borderRadius: 10, elevation: 4, backgroundColor: "#fff" },
  autocompleteRow: { paddingHorizontal: 12 },
  addressInput: { flex: 1, height: 44, fontSize: 14, color: "#1a3320" },
  suggestionsList: { backgroundColor: "#fff", borderRadius: 10, elevation: 6, marginTop: 4, overflow: "hidden" },
  suggestionRow: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  suggestionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#e8f3e8", alignItems: "center", justifyContent: "center", marginRight: 10 },
  suggestionName: { fontSize: 13, fontWeight: "600", color: "#1a3320" },
  suggestionSubtext: { fontSize: 11, color: "#7a9e7a", marginTop: 2 },
  suggestionText: { flex: 1, fontSize: 13, color: "#1a3320" },
  addressRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "rgba(88, 129, 87, 1)", paddingHorizontal: 12, marginBottom: 8 },
});