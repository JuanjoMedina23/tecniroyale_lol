import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoritePokemon = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
};

type FavoritesContextType = {
  favorites: FavoritePokemon[];
  addFavorite: (pokemon: FavoritePokemon) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (pokemon: FavoritePokemon) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const STORAGE_KEY = "@pokedex_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [loaded, setLoaded] = useState(false); // <- bandera para evitar sobreescritura

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (loaded) {
      saveFavorites();
    }
  }, [favorites]);

  async function loadFavorites() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoaded(true); // <- marcamos que ya cargó
    }
  }

  async function saveFavorites() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }

  function addFavorite(pokemon: FavoritePokemon) {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === pokemon.id)) return prev;
      return [...prev, pokemon];
    });
  }

  function removeFavorite(id: number) {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  }

  function isFavorite(id: number) {
    return favorites.some((fav) => fav.id === id);
  }

  function toggleFavorite(pokemon: FavoritePokemon) {
    if (isFavorite(pokemon.id)) {
      removeFavorite(pokemon.id);
    } else {
      addFavorite(pokemon);
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}