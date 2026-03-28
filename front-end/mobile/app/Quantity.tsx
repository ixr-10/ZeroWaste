import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter ,Stack  } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import {SafeAreaView} from 'react-native-safe-area-context';

const UNITS = ["Kg", "g", "L", "Pieces"];


export default function Quantity() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState("Kg");
  const [expirationDate, setExpirationDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="white" />
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
        <Image style={{width:40,height:40,marginBottom:4,}} source={require('../assets/images/mizan.png')}/>
        <Text style={styles.title}>Quantity & Expiration</Text>
        <Text style={styles.subtitle}>Indicate the available quantity and the deadline.</Text>

        <Text style={styles.sectionLabel}>Available Quantity</Text>
        <View style={styles.quantityRow}>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setQuantity((q) => Math.max(1, q - 1))}>
              <Ionicons name="remove-sharp" size={20} color="rgba(88, 129, 87, 1)" />
            </TouchableOpacity>
            <TextInput
                style={styles.stepperValue}
                value={String(quantity)}
                onChangeText={(val) => {
                  const num = parseInt(val);
                  if (!isNaN(num) && num > 0) setQuantity(num);
                  else if (val === "") setQuantity(0);
                }}
                keyboardType="numeric"
                textAlign="center"
              />
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setQuantity((q) => q + 1)}>
              <Ionicons name="add-sharp" size={20} color="rgba(88, 129, 87, 1)" />
            </TouchableOpacity>
          </View>
          <View style={styles.unitRow}>
            {UNITS.map((unit) => (
              <TouchableOpacity key={unit} style={[styles.unitBtn, selectedUnit === unit && styles.unitBtnSelected]} onPress={() => setSelectedUnit(unit)}>
                <Text style={[styles.unitText, selectedUnit === unit && styles.unitTextSelected]}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Expiration date</Text>
        <TouchableOpacity style={styles.dateInputWrapper} onPress={() => setShowPicker(true)}>
          <TextInput
            style={styles.dateInput}
            placeholder="dd/mm/yyyy"
            placeholderTextColor="#aac0aa"
            value={expirationDate}
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
            onChange={(event:any, selectedDate: Date | undefined) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                const year = selectedDate.getFullYear();
                setExpirationDate(`${day}/${month}/${year}`);
              }
            }}
             />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={() => router.push("/Localization")}>
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "white" },

  header: {paddingTop: 2, },
  backBtn: {marginLeft:15,marginTop:5, width: 32, height: 32, borderRadius: 16, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 2 },
  stepLabel: { fontSize: 16, color: "#7a9e7a", fontWeight: "600" ,justifyContent:'center',alignItems:'center' ,textAlign:'center'},
  stepTitle: { fontSize: 16, fontWeight: "700", color: "#1a3320", marginTop: 2, marginBottom: 8,justifyContent:'center',alignItems:'center' ,textAlign:'center', },

  progressBar: { height: 4, backgroundColor: "rgba(217, 217, 217, 1)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 2 },

  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 165 ,marginTop:0,backgroundColor:'rgb(209, 216, 196, 0.5)',justifyContent: 'space-between',height:500},
  title: { fontSize: 22, fontWeight: "800", color: "#1a3320", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#5a7a5a", lineHeight: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 14, fontWeight: "700", color: "#1a3320", marginBottom: 5 },

  quantityRow: { gap: 12 ,flexDirection:'column',alignItems: "center",width: '100%'},

  stepper: { flexDirection: "row", alignItems: "center", borderRadius: 10,  borderWidth: 1, borderColor: "transparent", overflow: "hidden" },
  stepperBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(217, 224, 201, 1)",borderRadius: 10 },
  stepperValue: { width: 48, textAlign: "center", fontSize: 20, fontWeight: "700", color: "#1a3320" },

  unitRow: { flexDirection: "row", gap: 5,alignItems: 'center', },
  unitBtn: { height: 40,paddingHorizontal: 12 , borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "white",paddingVertical:9, },
  unitBtnSelected: { backgroundColor: "#2d5a2d", borderColor: "#2d5a2d" },
  unitText: { fontSize: 13, color: "black", fontWeight: "500", textAlign: 'center',  },
  unitTextSelected: { color: "#fff", fontWeight: "700" },

  dateInputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#d4e4d4", paddingHorizontal: 14 },
  dateInput: { flex: 1, height: 48, fontSize: 14, color: "#1a3320" },

  footer: { paddingHorizontal: 24, paddingBottom: 10, gap: 10,backgroundColor:"white" ,marginTop:20 },
  continueBtn: { backgroundColor: "rgba(88, 129, 87, 1)", borderRadius: 25, paddingVertical: 16, alignItems: "center" },
  continueBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});