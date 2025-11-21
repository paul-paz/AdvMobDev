import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
  Entypo,
} from "@expo/vector-icons";

const SongInfoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const item = route?.params?.item;

  const albumUri = item?.track?.album?.uri || "";
  const albumParts = albumUri.split(":");
  const albumId = albumParts.length === 3 ? albumParts[2] : null;

  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!albumId) return;

      try {
        const accessToken = await AsyncStorage.getItem("token");
        if (!accessToken) return;

        const response = await fetch(
          `https://api.spotify.com/v1/albums/${albumId}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch album songs");
        }

        const data = await response.json();
        setTracks(data.items || []);
      } catch (error) {
        console.log("Error fetching album tracks:", error.message);
      }
    };

    fetchSongs();
  }, [albumId]);

  const albumImage =
    item?.track?.album?.images?.[0]?.url ||
    "https://via.placeholder.com/200x200.png?text=No+Image";

  return (
    <LinearGradient colors={["#040306", "#131624"]} style={{ flex: 1 }}>
      <ScrollView style={{ marginTop: 50 }}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="white"
          />

          <View style={{ flex: 1, alignItems: "center" }}>
            <Image source={{ uri: albumImage }} style={styles.albumImage} />
          </View>
        </View>

        {/* Song Name */}
        <Text style={styles.songTitle}>{item?.track?.name}</Text>

        {/* Artist */}
        <View style={styles.artistRow}>
          {item?.track?.artists?.map((artist) => (
            <Text key={artist.id} style={styles.artistText}>
              {artist.name}
            </Text>
          ))}
        </View>

        {/* Controls */}
        <Pressable style={styles.controlsRow}>
          <Pressable style={styles.downloadButton}>
            <AntDesign name="arrowdown" size={20} color="white" />
          </Pressable>

          <View style={styles.playControls}>
            <MaterialCommunityIcons
              name="cross-bolnisi"
              size={24}
              color="#1DB954"
            />

            <Pressable style={styles.playButton}>
              <Entypo name="controller-play" size={24} color="white" />
            </Pressable>
          </View>
        </Pressable>

        {/* Tracks List */}
        <View style={{ marginTop: 10, marginHorizontal: 12 }}>
          {tracks.map((track) => (
            <Pressable key={track.id} style={styles.trackRow}>
              <View>
                <Text style={styles.trackName}>{track.name}</Text>

                <View style={styles.trackArtistsRow}>
                  {track.artists.map((artist) => (
                    <Text key={artist.id} style={styles.trackArtistText}>
                      {artist.name}
                    </Text>
                  ))}
                </View>
              </View>

              <Entypo name="dots-three-vertical" size={20} color="white" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SongInfoScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 12,
  },
  albumImage: {
    width: 200,
    height: 200,
  },
  songTitle: {
    color: "white",
    marginHorizontal: 12,
    marginTop: 10,
    fontSize: 22,
    fontWeight: "bold",
  },
  artistRow: {
    marginHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 7,
  },
  artistText: {
    color: "#909090",
    fontSize: 13,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 10,
  },
  downloadButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  playControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  trackRow: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trackName: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  trackArtistsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  trackArtistText: {
    fontSize: 16,
    fontWeight: "500",
    color: "gray",
  },
});