import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

const ArtistCard = ({ item }) => {
  const imageUrl =
    item?.images?.[0]?.url ||
    "https://via.placeholder.com/150/000000/FFFFFF?text=No+Image";

  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: imageUrl }} style={styles.artistImage} />

      <Text style={styles.artistName}>
        {item?.name || "Unknown Artist"}
      </Text>
    </View>
  );
};

export default ArtistCard;

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
  },
  artistImage: {
    width: 130,
    height: 130,
    borderRadius: 5,
    backgroundColor: "#222",
  },
  artistName: {
    fontSize: 13,
    fontWeight: "500",
    color: "white",
    marginTop: 10,
  },
});