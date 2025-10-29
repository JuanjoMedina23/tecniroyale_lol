import React, { useEffect, useState } from "react";
import { Image, View, Text } from "react-native";
import axios from "axios";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const gifUrls = {
    front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemonId}.gif`,
    back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${pokemonId}.gif`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemonId}.gif`,
  };

  const staticUrls = {
    front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
    back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`,
    shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`,
  };

  useEffect(() => {
    let isMounted = true;

    const checkGifExists = async () => {
      const gifUrl = gifUrls[variant];
      const fallbackUrl = staticUrls[variant];

      // No hay GIFs más allá de la Gen 5
      if (pokemonId > 649) {
        setImageUrl(fallbackUrl);
        return;
      }

      try {
        // HEAD para solo verificar si existe
        const res = await axios.head(gifUrl);
        if (isMounted && res.status === 200) {
          setImageUrl(gifUrl);
        } else {
          setImageUrl(fallbackUrl);
        }
      } catch {
        // Si no existe o hay error, usamos PNG
        if (isMounted) setImageUrl(fallbackUrl);
      }
    };

    checkGifExists();

    return () => {
      isMounted = false;
    };
  }, [pokemonId, variant]);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          resizeMode="contain"
          onError={() => setImageError(true)}
          className={className}
        />
      ) : (
        <Text style={{ color: "gray", fontSize: 10 }}>Cargando...</Text>
      )}

      {imageError && (
        <Text style={{ position: "absolute", color: "gray", fontSize: 10 }}>
          Sin imagen
        </Text>
      )}
    </View>
  );
}
