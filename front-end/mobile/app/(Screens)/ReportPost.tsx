import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, BORDER_RADIUS } from "../../constants/theme";

const REASONS = [
  "Expired product posted as fresh",
  "Dangerous or unsafe food",
  "Misleading description",
  "Inappropriate content",
  "Spam",
  "Other",
];

export default function ReportPost() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [details, setDetails] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Post</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>

          {/* Reporting post preview */}
          <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Image source={require("../../assets/images/fruits.png")} style={styles.previewImage} />
                <View style={{flexDirection:'column'}}>
                  <Text style={styles.previewLabel}>Reporting Post</Text>
                  <Text style={styles.previewTitle}>Mixed Berries</Text>
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
            placeholder="Describe why this post is unsafe or misleading..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
            textAlignVertical="top"
          />

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
  previewLabel: { fontSize: 11, color: COLORS.textMuted, marginBottom: SPACING.xs },
  previewRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  previewImage: { width: 44, height: 44, borderRadius: BORDER_RADIUS.sm },
  previewTitle: { fontSize: 15, fontWeight: "600", color: COLORS.textPrimary },

  sectionLabel: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: SPACING.xs },

  reasonBtn: { backgroundColor: COLORS.white, borderRadius:20, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, borderWidth: 1, borderColor: "#BCCDBC" },
  reasonBtnSelected: { borderColor:'#588157', backgroundColor: "#D9E0C9" },
  reasonText: { fontSize: 13, color: COLORS.textPrimary },
  reasonTextSelected: { color: COLORS.primary, fontWeight: "600" },

  textArea: { backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.md, fontSize: 12, color: '#B2B0B0', minHeight: 90, borderWidth: 1, borderColor: '#BCCDBC' },

  submitBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full, paddingVertical: SPACING.md, alignItems: "center", marginTop: SPACING.sm },
  submitBtnDisabled: { backgroundColor: "rgba(88,129,87,0.4)" },
  submitBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});