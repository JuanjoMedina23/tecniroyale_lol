import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useFavorites } from "../context/FavoritesContext";

type FavoriteButtonProps = {
  pokemon: {
    id: number;
    name: string;
    imageUrl: string;
    types: string[];
  };
  size?: "sm" | "md" | "lg";
};

export default function FavoriteButton({
  pokemon,
  size = "md",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(pokemon.id);

  const sizeClasses = {
    sm: "px-3 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <TouchableOpacity
      onPress={() => toggleFavorite(pokemon)}
      className={`${
        favorite ? "bg-red-500" : "bg-gray-300"
      } ${sizeClasses[size]} rounded-xl shadow-md flex-row items-center justify-center`}
    >
      <Text className={textSizes[size]}>{favorite ? "❤️" : "🤍"}</Text>
      <Text className="text-white font-bold ml-2">
        {favorite ? "Favorito" : "Agregar"}
      </Text>
    </TouchableOpacity>
  );
}