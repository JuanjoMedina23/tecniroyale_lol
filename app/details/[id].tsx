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
import TypeBadge from "../../components/TypeBadge";
import StatBar from "../../components/StatBar";
import InfoCard from "../../components/InfoCard";
import PokeSound from "../../components/PokeSound";


type PokemonDetails = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  sprites?: {
    front_default?: string;
    back_default?: string;
    front_shiny?: string;
    other?: {
      "official-artwork"?: {
        front_default?: string;
      };
    };
  };
  types?: { type: { name: string } }[];
  stats?: { base_stat: number; stat: { name: string } }[];
  abilities?: { ability: { name: string }; is_hidden: boolean }[];
  moves?: { move: { name: string } }[];
  species: { url: string };
};

type Species = {
  flavor_text_entries?: { flavor_text: string; language: { name: string } }[];
  genera?: { genus: string; language: { name: string } }[];
};

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [species, setSpecies] = useState<Species | null>(null);
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
          ...data,
          sprites: {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`,
            back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${data.id}.gif`,
            front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${data.id}.gif`,
          }
        });

        // Fetch species data for description
        try {
          const speciesRes = await fetch(data.species.url);
          const speciesData = await speciesRes.json();
          if (mountedRef.current) {
            setSpecies(speciesData);
          }
        } catch (err) {
          console.error("Error fetching species:", err);
        }
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-red-600 items-center justify-center">
        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
        <Text className="text-white text-lg font-semibold">
          Cargando Pokédex...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !pokemon) {
    return (
      <SafeAreaView className="flex-1 bg-red-600">
        <View className="p-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white px-4 py-2 rounded-lg self-start shadow-md"
          >
            <Text className="text-red-600 font-semibold">← Volver</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-6xl mb-4">😢</Text>
          <Text className="text-white text-xl font-bold">
            {error || "Error desconocido"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const description =
    species?.flavor_text_entries?.find((entry) => entry.language.name === "es")
      ?.flavor_text ||
    species?.flavor_text_entries?.find((entry) => entry.language.name === "en")
      ?.flavor_text ||
    "No hay descripción disponible.";

  const genus =
    species?.genera?.find((g) => g.language.name === "es")?.genus ||
    species?.genera?.find((g) => g.language.name === "en")?.genus ||
    "Pokémon";

  const totalStats =
    pokemon.stats?.reduce((sum, s) => sum + s.base_stat, 0) || 0;

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView className="flex-1">
        {/* Header con Pokémon */}
        <View className="bg-red-600 pt-4 pb-8 px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white px-4 py-2 rounded-lg self-start mb-4 shadow-md"
          >
            <Text className="text-red-600 font-semibold">← Pokédex</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-white text-sm mb-2 opacity-90">
              #{pokemon.id.toString().padStart(3, "0")}
            </Text>
            {pokemon.sprites?.front_default ? (
              <Image
                source={{
                  uri: pokemon.sprites.front_default,
                }}
                className="w-56 h-56"
                resizeMode="contain"
              />
            ) : (
              <View className="w-56 h-56 bg-red-700 items-center justify-center rounded-xl">
                <Text className="text-white">Sin imagen</Text>
              </View>
            )}
            <Text className="text-4xl font-bold text-white capitalize mt-2">
              {pokemon.name}
            </Text>
            <Text className="text-white text-lg opacity-90 mt-1">{genus}</Text>
          </View>
        </View>

        <View className="px-4 -mt-4">
          {/* Tipos */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
            <View className="flex-row justify-center mb-3">
              {pokemon.types?.map((t, i) => (
                <TypeBadge key={i} type={t.type.name} size="lg" />
              ))}
            </View>
            
            {/* Botón de sonido */}
            <PokeSound pokemonId={pokemon.id} pokemonName={pokemon.name} />
          </View>

          {/* Descripción */}
          <InfoCard title="Descripción" icon="📖">
            <Text className="text-neutral-700 leading-6">
              {description.replace(/\f/g, " ")}
            </Text>
          </InfoCard>

          {/* Información física */}
          <InfoCard title="Datos Físicos" icon="📏">
            <View className="flex-row justify-around">
              <View className="items-center bg-blue-50 px-6 py-4 rounded-xl flex-1 mr-2">
                <Text className="text-3xl mb-1">📏</Text>
                <Text className="text-2xl font-bold text-blue-600">
                  {(pokemon.height / 10).toFixed(1)} m
                </Text>
                <Text className="text-neutral-600 mt-1">Altura</Text>
              </View>
              <View className="items-center bg-green-50 px-6 py-4 rounded-xl flex-1 ml-2">
                <Text className="text-3xl mb-1">⚖️</Text>
                <Text className="text-2xl font-bold text-green-600">
                  {(pokemon.weight / 10).toFixed(1)} kg
                </Text>
                <Text className="text-neutral-600 mt-1">Peso</Text>
              </View>
            </View>
            <View className="items-center bg-purple-50 px-6 py-4 rounded-xl mt-3">
              <Text className="text-3xl mb-1">⭐</Text>
              <Text className="text-2xl font-bold text-purple-600">
                {pokemon.base_experience}
              </Text>
              <Text className="text-neutral-600 mt-1">Experiencia Base</Text>
            </View>
          </InfoCard>

          {/* Habilidades */}
          <InfoCard title="Habilidades" icon="💪">
            <View className="flex-row flex-wrap">
              {pokemon.abilities?.map((a, i) => (
                <View
                  key={i}
                  className={`${
                    a.is_hidden ? "bg-purple-100" : "bg-neutral-100"
                  } px-4 py-2 rounded-full mr-2 mb-2`}
                >
                  <Text
                    className={`capitalize ${
                      a.is_hidden ? "text-purple-700 font-semibold" : ""
                    }`}
                  >
                    {a.ability.name.replace("-", " ")}
                    {a.is_hidden && " 🔒"}
                  </Text>
                </View>
              ))}
            </View>
            {pokemon.abilities?.some((a) => a.is_hidden) && (
              <Text className="text-xs text-neutral-500 mt-2">
                🔒 = Habilidad Oculta
              </Text>
            )}
          </InfoCard>

          {/* Stats */}
          <InfoCard title="Estadísticas Base" icon="📊">
            <View className="flex-row justify-between items-center mb-4">
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-700 font-bold">
                  Total: {totalStats}
                </Text>
              </View>
            </View>
            {pokemon.stats?.map((s, i) => (
              <StatBar key={i} name={s.stat.name} value={s.base_stat} />
            ))}
          </InfoCard>

          <InfoCard title="Variaciones" icon="🎨">
            <View className="flex-row justify-around">
              {pokemon.sprites?.front_default && (
                <View className="items-center bg-neutral-50 p-3 rounded-xl">
                  <Image
                    source={{ 
                      uri: pokemon.sprites.front_default
                    }}
                    className="w-24 h-24"
                  />
                  <Text className="text-sm text-neutral-600 mt-2 font-semibold">
                    Frente
                  </Text>
                </View>
              )}
              {pokemon.sprites?.back_default && (
                <View className="items-center bg-neutral-50 p-3 rounded-xl">
                  <Image
                    source={{ 
                      uri: pokemon.sprites.back_default
                    }}
                    className="w-24 h-24"
                  />
                  <Text className="text-sm text-neutral-600 mt-2 font-semibold">
                    Espalda
                  </Text>
                </View>
              )}
              {pokemon.sprites?.front_shiny && (
                <View className="items-center bg-yellow-50 p-3 rounded-xl">
                  <Image
                    source={{ 
                      uri: pokemon.sprites.front_shiny
                    }}
                    className="w-24 h-24"
                  />
                  <Text className="text-sm text-yellow-700 mt-2 font-semibold">
                    ✨ Shiny
                  </Text>
                </View>
              )}
            </View>
          </InfoCard>

          {/* Movimientos destacados */}
          {pokemon.moves && pokemon.moves.length > 0 && (
            <InfoCard title="Algunos Movimientos" icon="⚔️">
              <Text className="text-xs text-neutral-500 mb-3">
                Total de movimientos: {pokemon.moves.length}
              </Text>
              <View className="flex-row flex-wrap">
                {pokemon.moves.slice(0, 12).map((m, i) => (
                  <View
                    key={i}
                    className="bg-neutral-100 px-3 py-2 rounded-lg mr-2 mb-2"
                  >
                    <Text className="text-sm capitalize">
                      {m.move.name.replace("-", " ")}
                    </Text>
                  </View>
                ))}
              </View>
            </InfoCard>
          )}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}