import React from "react";
import { View, StyleSheet, Platform } from "react-native";

const MAX_WEB_WIDTH = 430;

export default function WebModalWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }
  return (
    <View style={wStyles.outer}>
      <View style={wStyles.inner}>{children}</View>
    </View>
  );
}

const wStyles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#000000",
    ...(Platform.OS === "web" ? { minHeight: "100vh" as any } : {}),
  },
  inner: {
    width: "100%",
    maxWidth: MAX_WEB_WIDTH,
    flex: 1,
    position: "relative",
    ...(Platform.OS === "web" ? { maxHeight: "100vh" as any } : {}),
  },
});
