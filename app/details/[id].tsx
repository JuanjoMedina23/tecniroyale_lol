import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites?: {
    front_default?: string;
    back_default?: string;
    front_shiny?: string;
  };
  types?: { type: { name: string } }[];
  stats?: { base_stat: number; stat: { name: string } }[];
  abilities?: { ability: { name: string } }[];
};

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (id) {
      fetchPokemonDetails(id as string);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [id]);

  async function fetchPokemonDetails(pokemonId: string) {
    setLoading(true);
    setError(null);

    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Pokémon no encontrado");
      }
      const data = await res.json();

      if (mountedRef.current) {
        setPokemon({
          id: data.id,
          name: data.name,
          height: data.height,
          weight: data.weight,
          sprites: data.sprites,
          types: data.types,
          stats: data.stats,
          abilities: data.abilities,
        });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message ?? "Error al cargar detalles");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      fire: "bg-orange-500",
      water: "bg-blue-500",
      grass: "bg-green-500",
      electric: "bg-yellow-400",
      psychic: "bg-pink-500",
      ice: "bg-cyan-400",
      dragon: "bg-indigo-600",
      dark: "bg-gray-800",
      fairy: "bg-pink-300",
      normal: "bg-gray-400",
      fighting: "bg-red-600",
      flying: "bg-indigo-400",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      rock: "bg-yellow-800",
      bug: "bg-green-600",
      ghost: "bg-purple-700",
      steel: "bg-gray-500",
    };
    return colors[type] || "bg-gray-400";
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-neutral-600">Cargando detalles...</Text>
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 bg-blue-600 px-4 py-2 rounded-lg self-start"
        >
          <Text className="text-white font-semibold">← Volver</Text>
        </TouchableOpacity>
        <View className="items-center mt-8">
          <Text className="text-red-600 text-lg">{error || "Error desconocido"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-4 bg-blue-600 px-4 py-2 rounded-lg self-start"
        >
          <Text className="text-white font-semibold">← Volver</Text>
        </TouchableOpacity>

        {/* Header con imagen */}
        <View className="bg-white rounded-lg p-6 mb-4 items-center shadow">
          <Text className="text-3xl font-bold capitalize mb-2">{pokemon.name}</Text>
          <Text className="text-neutral-500 mb-4">#{pokemon.id.toString().padStart(3, "0")}</Text>

          <View className="flex-row mb-4">
            {pokemon.types?.map((t, i) => (
              <View
                key={i}
                className={`${getTypeColor(t.type.name)} px-4 py-2 rounded-full mr-2`}
              >
                <Text className="text-white font-semibold capitalize">{t.type.name}</Text>
              </View>
            ))}
          </View>

          {pokemon.sprites?.front_default && (
            <Image
              source={{ uri: pokemon.sprites.front_default }}
              className="w-48 h-48"
              resizeMode="contain"
            />
          )}
        </View>

        {/* Información física */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-xl font-bold mb-3">Información Física</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {(pokemon.height / 10).toFixed(1)} m
              </Text>
              <Text className="text-neutral-600">Altura</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-600">
                {(pokemon.weight / 10).toFixed(1)} kg
              </Text>
              <Text className="text-neutral-600">Peso</Text>
            </View>
          </View>
        </View>

        {/* Habilidades */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-xl font-bold mb-3">Habilidades</Text>
          <View className="flex-row flex-wrap">
            {pokemon.abilities?.map((a, i) => (
              <View key={i} className="bg-neutral-100 px-3 py-2 rounded-lg mr-2 mb-2">
                <Text className="capitalize">{a.ability.name.replace("-", " ")}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View className="bg-white rounded-lg p-4 mb-4 shadow">
          <Text className="text-xl font-bold mb-3">Estadísticas Base</Text>
          {pokemon.stats?.map((s, i) => {
            const statName = s.stat.name
              .replace("hp", "HP")
              .replace("special-attack", "Ataque Esp.")
              .replace("special-defense", "Defensa Esp.")
              .replace("attack", "Ataque")
              .replace("defense", "Defensa")
              .replace("speed", "Velocidad");

            const percentage = (s.base_stat / 255) * 100;

            return (
              <View key={i} className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="capitalize font-medium">{statName}</Text>
                  <Text className="font-bold text-blue-600">{s.base_stat}</Text>
                </View>
                <View className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Sprites adicionales */}
        {(pokemon.sprites?.back_default || pokemon.sprites?.front_shiny) && (
          <View className="bg-white rounded-lg p-4 mb-4 shadow">
            <Text className="text-xl font-bold mb-3">Otros Sprites</Text>
            <View className="flex-row justify-around">
              {pokemon.sprites?.back_default && (
                <View className="items-center">
                  <Image
                    source={{ uri: pokemon.sprites.back_default }}
                    className="w-24 h-24"
                  />
                  <Text className="text-sm text-neutral-600 mt-1">Espalda</Text>
                </View>
              )}
              {pokemon.sprites?.front_shiny && (
                <View className="items-center">
                  <Image
                    source={{ uri: pokemon.sprites.front_shiny }}
                    className="w-24 h-24"
                  />
                  <Text className="text-sm text-neutral-600 mt-1">Shiny</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}