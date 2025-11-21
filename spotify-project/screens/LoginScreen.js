import { StyleSheet, Text, View, Pressable } from "react-native";
import React, { useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Buffer } from "buffer";
import { CLIENT_SECRET } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

const encoded = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const CLIENT_ID = "903c7357d3f7436b85cb8a6f98d8f1e6";

const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "myapp"
});

const SCOPES = [
  "user-read-email",
  "user-library-read",
  "user-read-recently-played",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public"
];

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

const LoginScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkTokenValidity = async () => {
      const accessToken = await AsyncStorage.getItem("token");
      const expirationDate = await AsyncStorage.getItem("expirationDate");

      if (accessToken && expirationDate) {
        const currentTime = Date.now();
        if (currentTime < parseInt(expirationDate)) {
          navigation.replace("Main");
        } else {
          AsyncStorage.removeItem("token");
          AsyncStorage.removeItem("expirationDate");
        }
      }
    };

    checkTokenValidity();
  }, []);

  async function authenticate() {
    const authUrl =
      `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES.join(" "))}`;

    const result = await AuthSession.startAsync({ authUrl });

    if (result.type === "success") {
      // Exchange the code for a real access token
      const response = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + encoded
        },
        body: `grant_type=authorization_code&code=${result.params.code}&redirect_uri=${encodeURIComponent(
          REDIRECT_URI
        )}`,
      });

      const tokenData = await response.json();

      if (tokenData.access_token) {
        const expirationDate =
          Date.now() + tokenData.expires_in * 1000;

        await AsyncStorage.setItem("token", tokenData.access_token);
        await AsyncStorage.setItem(
          "expirationDate",
          expirationDate.toString()
        );

        navigation.replace("Main");
      }
    }
  }

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <SafeAreaView>
        <View style={{ height: 80 }} />
        <Entypo
          style={{ textAlign: "center" }}
          name="spotify"
          size={80}
          color="white"
        />
        <Text
          style={{
            color: "white",
            fontSize: 40,
            fontWeight: "bold",
            textAlign: "center",
            marginTop: 40,
          }}
        >
          Millions of Songs Free on Spotify!
        </Text>

        <View style={{ height: 80 }} />
        <Pressable
          onPress={authenticate}
          style={styles.primaryButton}
        >
          <Text style={{ fontWeight: "700" }}>Sign In with Spotify</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <MaterialIcons name="phone-android" size={24} color="white" />
          <Text style={styles.secondaryText}>Continue with phone number</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <AntDesign name="google" size={24} color="red" />
          <Text style={styles.secondaryText}>Continue with Google</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton}>
          <Entypo name="facebook" size={24} color="blue" />
          <Text style={styles.secondaryText}>Sign In with Facebook</Text>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: "#1DB954",
    padding: 10,
    marginLeft: "auto",
    marginRight: "auto",
    width: 300,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  secondaryButton: {
    backgroundColor: "#131624",
    padding: 10,
    marginLeft: "auto",
    marginRight: "auto",
    width: 300,
    borderRadius: 25,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    borderColor: "#C0C0C0",
    borderWidth: 0.8,
  },
  secondaryText: {
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    flex: 1,
  },
});