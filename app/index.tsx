import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Link } from "expo-router";
import PokemonCard from "../components/PokemonCard";
import TypeBadge from "../components/TypeBadge";
import PokedexHeader from "../components/PokedexHeader";
import SearchBar from "../components/SearchBar";
import PokeSound from "../components/PokeSound";
import FavoriteButton from "../components/FavoriteButton";

type Pokemon = {
  id: number;
  name: string;
  sprites?: { front_default?: string };
  types?: { type: { name: string } }[];
};

type PokemonListItem = {
  name: string;
  url: string;
};

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [displayList, setDisplayList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<"search" | "browse">("browse");
  const mountedRef = useRef(true);

  useEffect(() => {
    fetchPokemonList();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const filtered = pokemonList.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      setDisplayList(filtered.slice(0, 20));
    } else {
      setDisplayList(pokemonList.slice(0, 20));
    }
  }, [query, pokemonList]);

  async function fetchPokemonList() {
    try {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
      const data = await res.json();
      if (mountedRef.current) {
        setPokemonList(data.results);
        setDisplayList(data.results.slice(0, 20));
      }
    } catch (err) {
      console.error("Error fetching list:", err);
    }
  }

  async function fetchPokemon(nameOrId: string) {
    const q = nameOrId.trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setError(null);
    setPokemon(null);
    setSearchMode("search");

    const url = `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(q)}`;

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
          sprites: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`
          },
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
    <SafeAreaView className="flex-1 bg-red-600">
      {/* Header Pokédex Style */}
      <View className="bg-red-600 p-6 pb-4">
        <View className="flex-row justify-between items-start mb-4">
          <PokedexHeader />
          
          <Link href="/favorites" asChild>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-lg shadow-md">
              <Text className="text-2xl">❤️</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <SearchBar
          value={query}
          onChangeText={setQuery}
          onSubmit={() => query && fetchPokemon(query)}
        />

        <View className="flex-row mt-3 space-x-2">
          <TouchableOpacity
            onPress={() => setSearchMode("browse")}
            className={`flex-1 py-2 rounded-lg ${
              searchMode === "browse" ? "bg-yellow-400" : "bg-red-700"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                searchMode === "browse" ? "text-red-900" : "text-white"
              }`}
            >
              📋 Explorar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setSearchMode("search");
              if (!pokemon && query) fetchPokemon(query);
            }}
            className={`flex-1 py-2 rounded-lg ${
              searchMode === "search" ? "bg-yellow-400" : "bg-red-700"
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                searchMode === "search" ? "text-red-900" : "text-white"
              }`}
            >
              🔎 Buscar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Area */}
      <View className="flex-1 bg-neutral-100">
        {searchMode === "browse" ? (
          <FlatList
            data={displayList}
            renderItem={({ item }) => (
              <PokemonCard
                name={item.name}
                url={item.url}
                onPress={() => fetchPokemon(item.name)}
              />
            )}
            keyExtractor={(item) => item.name}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between", paddingHorizontal: 12 }}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex-1 p-4">
            {loading && (
              <View className="items-center mt-20">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="mt-4 text-neutral-600 text-lg">
                  Buscando en la Pokédex...
                </Text>
              </View>
            )}

            {error && (
              <View className="mt-8 p-4 bg-red-100 rounded-xl">
                <Text className="text-red-700 text-center text-lg font-semibold">
                  ❌ {error}
                </Text>
                <Text className="text-red-600 text-center mt-2">
                  Intenta con otro nombre o número
                </Text>
              </View>
            )}

            {pokemon && !loading && (
              <View className="mt-4">
                <View className="bg-white rounded-2xl p-6 shadow-lg">
                  <View className="items-center mb-4">
                    <Text className="text-sm text-neutral-400 mb-1">
                      #{pokemon.id.toString().padStart(3, "0")}
                    </Text>
                    {pokemon.sprites?.front_default ? (
                      <Image
                        source={{ 
                          uri: pokemon.sprites.front_default
                        }}
                        className="w-40 h-40"
                      />
                    ) : (
                      <View className="w-40 h-40 bg-neutral-200 items-center justify-center rounded-xl">
                        <Text className="text-neutral-400">Sin imagen</Text>
                      </View>
                    )}
                    <Text className="text-3xl font-bold capitalize mt-2">
                      {pokemon.name}
                    </Text>
                  </View>

                  <View className="flex-row justify-center mb-6">
                    {pokemon.types?.map((t, i) => (
                      <TypeBadge key={i} type={t.type.name} size="md" />
                    ))}
                  </View>

                  {/* Botón de sonido */}
                  <View className="mb-4">
                    <PokeSound pokemonId={pokemon.id} pokemonName={pokemon.name} />
                  </View>

                  {/* Botón de favoritos */}
                  <View className="mb-4">
                    <FavoriteButton
                      pokemon={{
                        id: pokemon.id,
                        name: pokemon.name,
                        imageUrl: pokemon.sprites?.front_default || "",
                        types: pokemon.types?.map(t => t.type.name) || [],
                      }}
                    />
                  </View>

                  <Link href={`/details/${pokemon.id}` as any} asChild>
                    <TouchableOpacity className="bg-red-600 py-4 rounded-xl shadow-md">
                      <Text className="text-white font-bold text-center text-lg">
                        Ver Información Completa →
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                {/* Quick Stats Preview */}
                <View className="bg-white rounded-2xl p-4 mt-4 shadow-lg">
                  <Text className="text-lg font-bold mb-3 text-center">
                    Vista Rápida
                  </Text>
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <Text className="text-3xl">🎯</Text>
                      <Text className="text-xs text-neutral-500 mt-1">Tipo</Text>
                      <Text className="font-semibold">
                        {pokemon.types?.length || 0}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-3xl">📊</Text>
                      <Text className="text-xs text-neutral-500 mt-1">ID</Text>
                      <Text className="font-semibold">{pokemon.id}</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-3xl">⭐</Text>
                      <Text className="text-xs text-neutral-500 mt-1">Gen</Text>
                      <Text className="font-semibold">
                        {pokemon.id <= 151 ? "I" : "II+"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {!loading && !error && !pokemon && (
              <View className="items-center mt-20">
                <Text className="text-6xl mb-4">🔍</Text>
                <Text className="text-xl font-bold text-neutral-700">
                  Busca un Pokémon
                </Text>
                <Text className="text-neutral-500 mt-2 text-center px-8">
                  Escribe un nombre o número en el buscador
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}