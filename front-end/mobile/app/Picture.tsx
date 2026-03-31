import React, { useState } from "react";
import { View, Text,ScrollView,TouchableOpacity, StyleSheet, StatusBar, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {SafeAreaView} from 'react-native-safe-area-context';
import { FONTS } from "../constants/fonts";
import * as ImagePicker from 'expo-image-picker';

export default function Picture() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color="#2d4a2d" />
        </TouchableOpacity>
        <Text style={styles.stepLabel}>1/4</Text>
        <Text style={styles.stepTitle}>Picture</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "25%" }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Image style={{width:48,height:48,marginBottom:4,}} source={require('../assets/images/camera.png')}/>
        <Text style={styles.title}>Add a picture</Text>
        <Text style={styles.subtitle}>A beautiful photo helps beneficiaries to quickly identify the donation.</Text>

      <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} onPress={pickImage}>
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeBtn} onPress={removeImage}>
                <Ionicons name="close-circle" size={28} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ backgroundColor: 'rgba(232, 235, 225, 1)', borderRadius: 20, width: 83, height: 55, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="camera-outline" size={44} color="#black" />
              </View>
              <Text style={styles.uploadText}>Tap to add</Text>
            </>
          )}
        </TouchableOpacity>

        {selectedImage && (
          <TouchableOpacity style={styles.changeBtn} onPress={pickImage}>
            <Ionicons name="images-outline" size={16} color="rgba(88, 129, 87, 1)" />
            <Text style={styles.changeBtnText}>Change photo</Text>
          </TouchableOpacity>
        )}
        <View style={styles.tipRow}>
          <Image style={{width:25,height:25,}} source={require('../assets/images/lamp.png')}/>
          <Text style={styles.tipText}>Tip: photograph the food under a good light to attract more beneficiaries.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={() => router.push("/Details" as any)}>
          <Text style={styles.continueBtnText}>Continue </Text>
        </TouchableOpacity>
        <Text style={styles.skipText} onPress={() => router.push("/Details" as any)}>or skip this step</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },
  header: {paddingTop:2, },
  backBtn: { marginLeft:15,marginTop:5,width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center",elevation: 2 },
  stepLabel: { fontSize: 16, color: "#7a9e7a", fontWeight: "600",justifyContent:'center',alignItems:'center' ,textAlign:'center'},
  stepTitle: { fontSize: 16, fontWeight: "700", color: "#1a3320", marginTop: 2, marginBottom:13,textAlign:'center' },
  progressBar: { height: 4, backgroundColor: "rgba(217, 217, 217, 1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 2 },

  content: { paddingHorizontal: 24, paddingTop: 28,marginTop:0 ,backgroundColor:'rgb(209, 216, 196, 0.5)',paddingBottom: 40,minHeight:'100%'},
  title: { fontSize: 22, fontWeight: "800", color: "#1a3320", marginBottom: 8 },
  subtitle: {fontFamily:FONTS.regular, fontSize: 14, color: "#5a7a5a", lineHeight: 20, marginBottom: 28 },

  previewImage: { width: '100%', height: '100%', borderRadius: 25 },
  removeBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 14 },
  uploadBox: { backgroundColor: "rgba(217, 217, 217, 1)", borderRadius: 25, borderWidth: 1, borderColor: "rgba(88, 129, 87, 1)", borderStyle: "dashed", height: 250,alignSelf: "stretch", // instead of width:310
  alignItems: "center", 
  justifyContent: "center", marginBottom: 20 },
  uploadText: { marginTop: 10, color: "rgba(88, 129, 87, 1)", fontSize: 24, fontWeight: "500" },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginBottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(88, 129, 87, 1)',
  },
  changeBtnText: { color: 'rgba(88, 129, 87, 1)', fontSize: 13, fontWeight: '600' },
  tipRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16, gap: 8, backgroundColor: "#fffbe6", borderRadius: 20, padding: 12,borderWidth:1,borderColor:"rgba(253, 230, 138, 1)" },
  tipText: { flex: 1, fontSize: 13, color: "black", lineHeight: 17 },

  footer: { paddingHorizontal: 24, paddingBottom: 10, gap: 10 ,backgroundColor:"white" ,marginTop:20},
  continueBtn: { backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 25, paddingVertical: 16, alignItems: "center" },
  continueBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  skipText: { textAlign: "center", color: "rgba(178, 176, 176, 1)", fontSize: 13, marginTop: 4 },
});
