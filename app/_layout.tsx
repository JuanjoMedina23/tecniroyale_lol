import React from "react";
import { Stack } from "expo-router";
import { FavoritesProvider } from "../context/FavoritesContext";
import "../global.css";

export default function Layout() {
  return (
    <FavoritesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FavoritesProvider>
  );
}