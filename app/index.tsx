import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";

type Pokemon = {
  id: number;
  name: string;
  sprites?: { front_default?: string };
  types?: { type: { name: string } }[];
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Puedes precargar un Pokémon por defecto si quieres
    // fetchPokemon("pikachu");

    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function fetchPokemon(nameOrId: string) {
    const q = nameOrId.trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setError(null);
    setPokemon(null);

    const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Pokémon no encontrado");
      }
      const data = await res.json();
      
      // Solo actualizar estado si el componente está montado
      if (mountedRef.current) {
        setPokemon({
          id: data.id,
          name: data.name,
          sprites: data.sprites,
          types: data.types,
        });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message ?? "Error al buscar");
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 p-4">
      <View className="mb-4">
        <Text className="text-2xl font-bold mb-2">Buscador de Pokémon</Text>
        <Text className="text-sm text-neutral-600">
          Busca por nombre o id (ej: pikachu o 25)
        </Text>
      </View>

      <View className="flex-row items-center mb-4">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Ej: bulbasaur"
          className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 mr-2 bg-white"
          onSubmitEditing={() => fetchPokemon(query)}
          returnKeyType="search"
        />

        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={() => fetchPokemon(query)}
        >
          <Text className="text-white font-semibold">Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="items-center mt-6">
          <ActivityIndicator size="large" />
          <Text className="mt-2">Buscando...</Text>
        </View>
      )}

      {error && (
        <View className="mt-4 p-3 bg-red-100 rounded">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      {pokemon && (
        <View className="mt-4 p-4 bg-white rounded-lg shadow">
          <View className="flex-row items-center">
            {pokemon.sprites?.front_default ? (
              <Image
                source={{ uri: pokemon.sprites.front_default }}
                className="w-24 h-24 mr-4"
              />
            ) : (
              <View className="w-24 h-24 mr-4 bg-neutral-200 items-center justify-center rounded">
                <Text>No image</Text>
              </View>
            )}

            <View>
              <Text className="text-xl font-bold capitalize">
                {pokemon.name}
              </Text>
              <Text className="text-sm text-neutral-500">ID: {pokemon.id}</Text>
              <View className="flex-row mt-2">
                {pokemon.types?.map((t, i) => (
                  <View key={i} className="mr-2 px-2 py-1 bg-neutral-100 rounded">
                    <Text className="text-sm capitalize">{t.type.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View className="mt-4">
          <Link href={`/details/${pokemon.id}` as any}>
              <Text className="text-blue-600">Ver detalles</Text>
            </Link>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}