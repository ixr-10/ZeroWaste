import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

const REASONS = [
  "Fake account",
  "Misleading information",
  "Rude or inappropriate behavior",
  "Spam",
  "Other",
];

export default function ReportProfile() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>("Fake account");
  const [details, setDetails] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const pickScreenshot = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setScreenshot(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Profile</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>

          {/* Reporting profile preview */}
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Image source={require("../../assets/images/avatar.png")} style={styles.previewImage} />
              <View style={{flexDirection:'column'}}>
                <Text style={styles.previewLabel}>Reporting Profile</Text>
                <Text style={styles.previewTitle}>Username</Text>
              </View>
            </View>
          </View>

          {/* Reasons */}
          <Text style={styles.sectionLabel}>Reason for Report <Text style={{ color: COLORS.emergencyRed }}>*</Text></Text>
          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonBtn, selected === reason && styles.reasonBtnSelected]}
              onPress={() => setSelected(reason)}
            >
              <Text style={[styles.reasonText, selected === reason && styles.reasonTextSelected]}>{reason}</Text>
            </TouchableOpacity>
          ))}

          {/* Additional details */}
          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Additional details (optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Provide any additional details that can help us review this profile..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            value={details}
            onChangeText={setDetails}
            textAlignVertical="top"
          />

          {/* Screenshot */}
          <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>Attach a screenshot (optional)</Text>
          <TouchableOpacity style={styles.screenshotBox} onPress={pickScreenshot}>
            {screenshot ? (
              <Image source={{ uri: screenshot }} style={styles.screenshotPreview} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.screenshotLabel}>Tap to add</Text>
                <Text style={styles.screenshotSub}>Attach a screenshot to help us understand the issue</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
            onPress={() => { if (selected) router.back(); }}
          >
            <Text style={styles.submitBtnText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor:'white' },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.background },
  backBtn: { width: 32, height: 32, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.cardBg, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: COLORS.textPrimary },

  content: { padding: SPACING.lg },

  card: { backgroundColor: '#E8EBE1', borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, gap: SPACING.sm },
  previewCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm },
  previewLabel: { fontSize: 11, color: '#A29F9F', marginBottom: SPACING.xs },
  previewRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  previewImage: { width: 46, height: 46, borderRadius: BORDER_RADIUS.full },
  previewTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },

  sectionLabel: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: SPACING.xs },
  reasonBtn: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: "#BCCDBC" },
  reasonBtnSelected: { borderColor: '#588157', backgroundColor: "#D9E0C9" },
  reasonText: { fontSize: 13, color: 'black' },
  reasonTextSelected: { color: COLORS.primary, fontWeight: "600" },

  textArea: { backgroundColor: COLORS.white, borderRadius:20, padding: SPACING.md, fontSize: 13, color: COLORS.textPrimary, minHeight: 80, borderWidth: 1, borderColor: '#B2B0B0' },

  screenshotBox: { backgroundColor: '#D9D9D9', borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderColor: '#588157', borderStyle: "dashed", minHeight: 110, alignItems: "center", justifyContent: "center", padding: SPACING.lg, gap: SPACING.xs },
  screenshotPreview: { width: "100%", height: 110, borderRadius: BORDER_RADIUS.md },
  screenshotLabel: { fontSize: 14, fontWeight: "600", color: '#588157' },
  screenshotSub: { fontSize: 11, color: COLORS.textMuted, textAlign: "center" },

  submitBtn: { backgroundColor: '#588157', borderRadius: BORDER_RADIUS.full, paddingVertical: SPACING.md, alignItems: "center", marginTop: SPACING.sm },
  submitBtnDisabled: { backgroundColor: "rgba(88,129,87,0.4)" },
  submitBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});