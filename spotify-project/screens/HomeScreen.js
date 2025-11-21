import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  FlatList,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import ArtistCard from "../components/ArtistCard";
import RecentlyPlayedCard from "../components/RecentlyPlayedCard";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [recentlyplayed, setRecentlyPlayed] = useState([]);
  const [topArtists, setTopArtists] = useState([]);

  const navigation = useNavigation();

  // Greeting message
  const greetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 16) return "Good Afternoon";
    return "Good Evening";
  };
  const message = greetingMessage();

  //  Fetch user profile
  const getProfile = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) return;

      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await response.json();
      setUserProfile(data);
    } catch (err) {
      console.log("Profile Error:", err.message);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Fetch Recently Played
  const getRecentlyPlayedSongs = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) return;

      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/recently-played?limit=4",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setRecentlyPlayed(response.data.items);
    } catch (err) {
      console.log("Recently Played Error:", err.message);
    }
  }, []);

  useEffect(() => {
    getRecentlyPlayedSongs();
  }, [getRecentlyPlayedSongs]);

  // Fetch top artists
  const getTopArtists = useCallback(async () => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) return;

      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setTopArtists(response.data.items);
    } catch (err) {
      console.log("Top Artists Error:", err.message);
    }
  }, []);

  useEffect(() => {
    getTopArtists();
  }, [getTopArtists]);

  // Render Recently Played Grid Item
  const renderItem = ({ item }) => (
    <Pressable style={styles.recentItem}>
      <Image
        style={styles.recentImage}
        source={{ uri: item.track?.album?.images?.[0]?.url }}
      />

      <View style={styles.recentTextWrapper}>
        <Text numberOfLines={2} style={styles.recentTitle}>
          {item.track?.name}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              style={styles.profileImage}
              source={{
                uri: userProfile?.images?.[0]?.url ?? "https://i.pravatar.cc/300",
              }}
            />
            <Text style={styles.greeting}>{message}</Text>
          </View>

          <MaterialCommunityIcons
            name="lightning-bolt-outline"
            size={24}
            color="white"
          />
        </View>

        {/* Category buttons */}
        <View style={styles.categoryContainer}>
          <Pressable style={styles.categoryBtn}>
            <Text style={styles.categoryText}>Music</Text>
          </Pressable>

          <Pressable style={styles.categoryBtn}>
            <Text style={styles.categoryText}>Podcasts & Shows</Text>
          </Pressable>
        </View>

        {/* Liked songs + random artist */}
        <View style={styles.row}>
          <Pressable
            onPress={() => navigation.navigate("Liked")}
            style={styles.likedCard}
          >
            <LinearGradient colors={["#33006F", "#FFFFFF"]}>
              <View style={styles.likedIconWrapper}>
                <AntDesign name="heart" size={24} color="white" />
              </View>
            </LinearGradient>

            <Text style={styles.likedText}>Liked Songs</Text>
          </Pressable>

          <View style={styles.randomArtistCard}>
            <Image
              style={styles.randomArtistImage}
              source={{ uri: "https://i.pravatar.cc/100" }}
            />
            <View>
              <Text style={styles.randomArtistName}>Hiphop Tamhiza</Text>
            </View>
          </View>
        </View>

        {/* Recently Played Grid */}
        <FlatList
          data={recentlyplayed}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />

        {/* Top Artists */}
        <Text style={styles.sectionTitle}>Your Top Artists</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {topArtists.map((item, index) => (
            <ArtistCard item={item} key={index} />
          ))}
        </ScrollView>

        {/* Recently Played Horizontal */}
        <Text style={styles.sectionTitle}>Recently Played</Text>
        <FlatList
          data={recentlyplayed}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <RecentlyPlayedCard item={item} key={index} />
          )}
        />
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  header: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  categoryContainer: {
    marginHorizontal: 12,
    marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryBtn: {
    backgroundColor: "#282828",
    padding: 10,
    borderRadius: 30,
  },
  categoryText: {
    fontSize: 15,
    color: "white",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  likedCard: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: "#202020",
    borderRadius: 4,
  },
  likedIconWrapper: {
    width: 55,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  likedText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  randomArtistCard: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 8,
    backgroundColor: "#202020",
    borderRadius: 4,
  },
  randomArtistImage: {
    width: 55,
    height: 55,
  },
  randomArtistName: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  recentItem: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#282828",
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 4,
    padding: 5,
    gap: 10,
  },
  recentImage: {
    height: 55,
    width: 55,
  },
  recentTextWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "white",
  },
  sectionTitle: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    marginHorizontal: 10,
    marginTop: 10,
  },
});