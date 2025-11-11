import React from "react";
import { Stack } from "expo-router";
import { FavoritesProvider } from "../context/FavoritesContext";
import { EquipoProvider } from "../context/EquipoContext"; 
import "../global.css";

export default function Layout() {
  return (
    <FavoritesProvider>
      <EquipoProvider> 
        <Stack screenOptions={{ headerShown: false }} />
      </EquipoProvider>
    </FavoritesProvider>
  );
}
