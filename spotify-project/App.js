import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { ModalPortal } from "react-native-modal";
import { PlayerProvider } from "./PlayerContext"; 
import Navigation from "./StackNavigator";
import 'react-native-gesture-handler';

export default function App() {
  return (
    <PlayerProvider>
      <Navigation />
      <ModalPortal />
      <StatusBar style="auto" />
    </PlayerProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});