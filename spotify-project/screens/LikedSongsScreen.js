import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SongItem from "../components/SongItem";
import { PlayerContext } from "../PlayerContext";     // FIXED IMPORT
import { BottomModal, ModalContent } from "react-native-modal";
import { Audio } from 'expo-audio';
import { debounce } from "lodash";

const LikedSongsScreen = () => {
  const navigation = useNavigation();
  const { currentTrack, setCurrentTrack } = useContext(PlayerContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [searchedTracks, setSearchedTracks] = useState([]);
  const [input, setInput] = useState("");
  const [savedTracks, setSavedTracks] = useState([]);

  const [currentSound, setCurrentSound] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const trackIndex = useRef(0);

  // ---------------------------
  // 🎵 FETCH USER'S LIKED TRACKS
  // ---------------------------
  const getSavedTracks = async () => {
    const accessToken = await AsyncStorage.getItem("token");
    const response = await fetch(
      "https://api.spotify.com/v1/me/tracks?offset=0&limit=50",
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) throw new Error("Failed to fetch tracks");

    const data = await response.json();
    setSavedTracks(data.items);
  };

  useEffect(() => {
    getSavedTracks();
  }, []);

  // ---------------------------
  // 🔍 SEARCH FILTER
  // ---------------------------
  const handleSearch = (text) => {
    const filtered = savedTracks.filter((item) =>
      item.track.name.toLowerCase().includes(text.toLowerCase())
    );
    setSearchedTracks(filtered);
  };

  const debouncedSearch = useCallback(debounce(handleSearch, 600), []);
  const handleInputChange = (text) => {
    setInput(text);
    debouncedSearch(text);
  };

  useEffect(() => {
    handleSearch(input);
  }, [savedTracks]);

  // ---------------------------
  // 🎧 AUDIO PLAYER SETUP
  // ---------------------------
  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      setProgress(status.positionMillis / status.durationMillis);
      setCurrentTime(status.positionMillis);
      setTotalDuration(status.durationMillis);
    }

    if (status.didJustFinish) playNextTrack();
  };

  const play = async (track) => {
    if (!track?.track?.preview_url) {
      console.log("No preview available");
      return;
    }

    try {
      if (currentSound) await currentSound.unloadAsync();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.track.preview_url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setCurrentSound(sound);
      setIsPlaying(true);
      setCurrentTrack(track);
    } catch (err) {
      console.log(err.message);
    }
  };

  const playTrack = () => {
    if (savedTracks.length === 0) return;
    trackIndex.current = 0;
    play(savedTracks[0]);
  };

  const playNextTrack = async () => {
    trackIndex.current += 1;
    if (trackIndex.current < savedTracks.length) {
      await play(savedTracks[trackIndex.current]);
    }
  };

  const playPreviousTrack = async () => {
    trackIndex.current -= 1;
    if (trackIndex.current >= 0) {
      await play(savedTracks[trackIndex.current]);
    }
  };

  const handlePlayPause = async () => {
    if (!currentSound) return;

    if (isPlaying) await currentSound.pauseAsync();
    else await currentSound.playAsync();

    setIsPlaying(!isPlaying);
  };

  const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <>
      <LinearGradient colors={["#614385", "#516395"]} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, marginTop: 50 }}>
          {/* BACK BUTTON */}
          <Pressable onPress={() => navigation.goBack()} style={{ marginHorizontal: 10 }}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>

          {/* SEARCH BAR */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <AntDesign name="search1" size={18} color="white" />
              <TextInput
                value={input}
                onChangeText={handleInputChange}
                placeholder="Find in Liked songs"
                placeholderTextColor={"#ccc"}
                style={{ color: "white", flex: 1 }}
              />
            </View>

            <Pressable style={styles.sortButton}>
              <Text style={{ color: "white" }}>Sort</Text>
            </Pressable>
          </View>

          {/* HEADER */}
          <View style={{ marginHorizontal: 10, marginTop: 20 }}>
            <Text style={styles.title}>Liked Songs</Text>
            <Text style={styles.subtitle}>{savedTracks.length} songs</Text>
          </View>

          {/* PLAY BUTTONS */}
          <View style={styles.playRow}>
            <Pressable style={styles.circleButton}>
              <AntDesign name="arrowdown" size={20} color="white" />
            </Pressable>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <MaterialCommunityIcons name="cross-bolnisi" size={24} color="#1DB954" />
              <Pressable onPress={playTrack} style={styles.playCircle}>
                <Entypo name="controller-play" size={24} color="white" />
              </Pressable>
            </View>
          </View>

          {/* TRACK LIST */}
          {searchedTracks.length === 0 ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <FlatList
              scrollEnabled={false}
              data={searchedTracks}
              renderItem={({ item }) => (
                <SongItem item={item} onPress={play} isPlaying={item === currentTrack} />
              )}
            />
          )}
        </ScrollView>
      </LinearGradient>

      {/* NOW PLAYING BAR */}
      {currentTrack && (
        <Pressable
          onPress={() => setModalVisible(true)}
          style={styles.nowPlayingBar}
        >
          <View style={styles.nowPlayingLeft}>
            <Image
              style={styles.thumb}
              source={{ uri: currentTrack.track.album.images[0].url }}
            />
            <Text numberOfLines={1} style={styles.nowPlayingText}>
              {currentTrack.track.name} • {currentTrack.track.artists[0].name}
            </Text>
          </View>

          {isPlaying ? (
            <AntDesign name="pausecircle" size={28} color="white" onPress={handlePlayPause} />
          ) : (
            <AntDesign name="playcircleo" size={28} color="white" onPress={handlePlayPause} />
          )}
        </Pressable>
      )}

      {/* FULLSCREEN MODAL PLAYER */}
      <BottomModal visible={modalVisible} onHardwareBackPress={() => setModalVisible(false)}>
        <ModalContent style={styles.modalContent}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <AntDesign name="down" size={24} color="white" onPress={() => setModalVisible(false)} />
            <Text style={styles.modalTitle}>{currentTrack?.track?.name}</Text>
            <Entypo name="dots-three-vertical" size={22} color="white" />
          </View>

          {/* ARTWORK */}
          <Image
            style={styles.modalArt}
            source={{ uri: currentTrack?.track?.album?.images[0].url }}
          />

          {/* TITLE + ARTIST */}
          <View style={styles.infoSection}>
            <View>
              <Text style={styles.songName}>{currentTrack?.track?.name}</Text>
              <Text style={styles.artistName}>{currentTrack?.track?.artists[0].name}</Text>
            </View>
            <AntDesign name="heart" size={24} color="#1DB954" />
          </View>

          {/* PROGRESS BAR */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <View style={styles.timeRow}>
              <Text style={styles.time}>{formatTime(currentTime)}</Text>
              <Text style={styles.time}>{formatTime(totalDuration)}</Text>
            </View>
          </View>

          {/* PLAYER CONTROLS */}
          <View style={styles.controlsRow}>
            <FontAwesome name="arrows" size={30} color="#03C03C" />
            <Ionicons name="play-skip-back" size={30} color="white" onPress={playPreviousTrack} />

            {isPlaying ? (
              <AntDesign name="pausecircle" size={60} color="white" onPress={handlePlayPause} />
            ) : (
              <Pressable style={styles.playButtonBig} onPress={handlePlayPause}>
                <Entypo name="controller-play" size={26} color="black" />
              </Pressable>
            )}

            <Ionicons name="play-skip-forward" size={30} color="white" onPress={playNextTrack} />
            <Feather name="repeat" size={30} color="#03C03C" />
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

export default LikedSongsScreen;

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    marginHorizontal: 10,
    marginTop: 12,
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#42275a",
    padding: 9,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sortButton: {
    marginLeft: 10,
    backgroundColor: "#42275a",
    padding: 10,
    borderRadius: 6,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "white" },
  subtitle: { color: "white", opacity: 0.7, marginTop: 4 },
  playRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 15,
    alignItems: "center",
  },
  circleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  nowPlayingBar: {
    position: "absolute",
    bottom: 10,
    width: "90%",
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#5072A7",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nowPlayingLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  nowPlayingText: {
    width: 220,
    color: "white",
    fontWeight: "bold",
  },
  thumb: { width: 40, height: 40 },
  modalContent: {
    width: "100%",
    height: "100%",
    backgroundColor: "#5072A7",
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  modalTitle: { color: "white", fontSize: 16, fontWeight: "bold" },
  modalArt: {
    width: "90%",
    height: 330,
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 30,
  },
  infoSection: {
    marginHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  songName: { color: "white", fontSize: 22, fontWeight: "bold" },
  artistName: { color: "#D3D3D3", marginTop: 4 },
  progressContainer: { marginTop: 20, marginHorizontal: 20 },
  progressBackground: {
    height: 3,
    backgroundColor: "gray",
    borderRadius: 5,
  },
  progressFill: {
    height: 3,
    backgroundColor: "white",
    borderRadius: 5,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  time: { color: "#D3D3D3", fontSize: 12 },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  playButtonBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
