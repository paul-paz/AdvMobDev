import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React, { useContext } from "react";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { PlayerContext } from "../PlayerContext";


const SongItem = ({ item, onPress, isPlaying }) => {
  const { player, setPlayer } = useContext(PlayerContext);

  const handlePress = () => {
    setCurrentTrack(item);
    onPress(item);
  };

  const imageUrl =
    item?.track?.album?.images?.[0]?.url ||
    "https://via.placeholder.com/50/000000/FFFFFF?text=No+Image";

  const trackName = item?.track?.name || "Unknown Track";
  const artistName = item?.track?.artists?.[0]?.name || "Unknown Artist";

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.albumImage} />

      <View style={styles.textContainer}>
        <Text style={[styles.trackName, isPlaying && styles.playingTrack]}>
          {trackName}
        </Text>
        <Text style={styles.artistName}>{artistName}</Text>
      </View>

      <View style={styles.iconsContainer}>
        <AntDesign name="heart" size={24} color="#1DB954" />
        <Entypo name="dots-three-vertical" size={24} color="#C0C0C0" />
      </View>
    </Pressable>
  );
};

export default SongItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  albumImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 4,
    backgroundColor: "#222",
  },
  textContainer: {
    flex: 1,
  },
  trackName: {
    fontWeight: "bold",
    fontSize: 14,
    color: "white",
  },
  playingTrack: {
    color: "#3FFF00",
  },
  artistName: {
    marginTop: 4,
    color: "#989898",
    fontSize: 12,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 10,
  },
});