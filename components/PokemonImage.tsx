import React, { useState } from "react";
import { Image, View, Text, ImageStyle, StyleProp } from "react-native";

type PokemonImageProps = {
  pokemonId: number;
  size?: number;
  variant?: "front" | "back" | "shiny";
  className?: string;
};

export default function PokemonImage({
  pokemonId,
  size = 96,
  variant = "front",
  className = "",
}: PokemonImageProps) {
  const [imageError, setImageError] = useState(false);

  // URLs de GIFs animados
  const gifUrls = {
    front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`,
    back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${pokemonId}.gif`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemonId}.gif`,
  };

  // URLs de imágenes estáticas (fallback)
  const staticUrls = {
    front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
    back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`,
  };

  const imageUrl = imageError ? staticUrls[variant] : gifUrls[variant];

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: size, height: size }}
      className={className}
      resizeMode="contain"
      onError={() => setImageError(true)}
    />
  );
}