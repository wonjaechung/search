import { Dimensions, Platform } from "react-native";

const MAX_WEB_WIDTH = 430;

export function getScreenWidth(): number {
  const w = Dimensions.get("window").width;
  if (Platform.OS === "web") {
    return Math.min(w, MAX_WEB_WIDTH);
  }
  return w;
}

export function getScreenHeight(): number {
  return Dimensions.get("window").height;
}
