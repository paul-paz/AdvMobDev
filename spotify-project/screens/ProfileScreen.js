import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await getProfile();
      await getPlaylists();
    };
    fetchData();
  }, []);

  const getProfile = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) return;

      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUserProfile(response.data);
    } catch (error) {
      console.log("Error fetching Spotify profile:", error);
    }
  };

  const getPlaylists = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) return;

      const response = await axios.get(
        "https://api.spotify.com/v1/me/playlists",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setPlaylists(response.data.items || []);
    } catch (error) {
      console.error("Error retrieving playlists:", error);
    }
  };

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        <View style={{ padding: 12 }}>
          {/* Profile Section */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image
              style={styles.profileImage}
              source={{
                uri:
                  userProfile?.images?.[0]?.url ||
                  "https://i.pravatar.cc/300?img=12",
              }}
            />
            <View>
              <Text style={styles.nameText}>
                {userProfile?.display_name || "Loading..."}
              </Text>
              <Text style={styles.emailText}>{userProfile?.email}</Text>
            </View>
          </View>
        </View>

        {/* Playlist Header */}
        <Text style={styles.playlistHeader}>Your Playlists</Text>

        {/* Playlist List */}
        <View style={{ padding: 15 }}>
          {playlists.map((item) => (
            <View
              key={item.id}
              style={styles.playlistRow}
            >
              <Image
                source={{
                  uri:
                    item?.images?.[0]?.url ||
                    "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg",
                }}
                style={styles.playlistImage}
              />
              <View>
                <Text style={styles.playlistName}>{item.name}</Text>
                <Text style={styles.playlistFollowers}>
                  {item.followers?.total || 0} followers
                </Text>
              </View>
            </View>
          ))}

          {playlists.length === 0 && (
            <Text style={{ color: "gray", textAlign: "center", marginTop: 20 }}>
              No playlists found.
            </Text>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emailText: {
    color: "gray",
    fontSize: 16,
  },
  playlistHeader: {
    color: "white",
    fontSize: 20,
    fontWeight: "500",
    marginHorizontal: 12,
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 10,
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  playlistName: {
    color: "white",
  },
  playlistFollowers: {
    color: "white",
    marginTop: 7,
    opacity: 0.7,
  },
});