import { StyleSheet, Text, View, Pressable, Image } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const RecentlyPlayedCard = ({ item }) => {
  const navigation = useNavigation();

  const imageUrl =
    item?.track?.album?.images?.[0]?.url ||
    "https://via.placeholder.com/130/000000/FFFFFF?text=No+Image";

  const trackName = item?.track?.name || "Unknown Track";

  return (
    <Pressable
      onPress={() =>
        navigation.navigate("Info", {
          item: item,
        })
      }
      style={styles.cardContainer}
    >
      <Image source={{ uri: imageUrl }} style={styles.albumImage} />
      <Text numberOfLines={1} style={styles.trackName}>
        {trackName}
      </Text>
    </Pressable>
  );
};

export default RecentlyPlayedCard;

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
  },
  albumImage: {
    width: 130,
    height: 130,
    borderRadius: 5,
    backgroundColor: "#222",
  },
  trackName: {
    fontSize: 13,
    fontWeight: "500",
    color: "white",
    marginTop: 10,
  },
});