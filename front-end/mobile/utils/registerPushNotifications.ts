// utils/registerPushNotifications.ts
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function registerPushNotifications(): Promise<string | null> {
  // Guard: skip entirely in Expo Go on Android (SDK 53+)
  if (Constants.appOwnership === "expo" && Platform.OS === "android") {
    console.warn("Push notifications not supported in Expo Go on Android. Use a dev build.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });

  return token.data;
}