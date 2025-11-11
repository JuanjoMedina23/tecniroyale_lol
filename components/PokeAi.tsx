import { getTypeColor } from "@/components/ui/CustomColor";
import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useEquipos } from "../context/EquipoContext";
import { useFavorites } from "../context/FavoritesContext";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  pokemonCards?: PokemonCard[];
};

type PokemonCard = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
};

export default function PokeAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { favorites } = useFavorites();
  const { teams, addTeam } = useEquipos();

  // Corregido: Acceder a la API key correctamente
  const APIKEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
  
  // Verificar si la API key existe
  if (!APIKEY) {
    console.error("⚠️ EXPO_PUBLIC_GEMINI_API_KEY no está configurada en el .env");
  }

  const ai = new GoogleGenAI({ apiKey: APIKEY });

  // Auto scroll
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

  const fetchPokemonData = async (pokemonIds: number[]): Promise<PokemonCard[]> => {
    const promises = pokemonIds.map(async (id) => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`,
          types: data.types.map((t: any) => t.type.name),
        };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((p): p is PokemonCard => p !== null);
  };

  const sendMessage = async () => {
    if (!value.trim()) return;

    // Verificar API key antes de enviar
    if (!APIKEY) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "❌ Error: API key no configurada. Verifica tu archivo .env",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: value,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = value;
    setValue("");
    setIsLoading(true);

    try {
      const favoritesInfo =
        favorites.length > 0
          ? `Pokémon favoritos del usuario: ${favorites
              .map(
                (f) => `${f.name} (ID: ${f.id}, Tipos: ${f.types.join(", ")})`
              )
              .join(", ")}`
          : "El usuario aún no tiene Pokémon favoritos.";

      const equiposInfo =
        teams.length > 0
          ? `Equipos del usuario: ${teams
              .map(
                (t) =>
                  `${t.name} (${t.pokemons
                    .map((p) => p.name)
                    .join(", ")})`
              )
              .join("; ")}`
          : "El usuario aún no tiene equipos Pokémon.";

      const enhancedPrompt = `
Eres un asistente experto en Pokémon.
${favoritesInfo}
${equiposInfo}
Total de favoritos: ${favorites.length}.
Total de equipos: ${teams.length}.

IMPORTANTE:
Si el usuario te pide buscar, mostrar, recomendar o listar Pokémon específicos,
responde ÚNICAMENTE con un JSON:
{"action": "show_pokemon", "pokemon_ids": [1,2,3], "message": "Aquí están los Pokémon que buscaste"}

Si el usuario te pide crear, mostrar o recomendar un EQUIPO Pokémon,
responde con un JSON:
{"action": "show_team", "team_name": "Equipo Fuego", "pokemon_ids": [4,5,6], "message": "Aquí tienes tu equipo de fuego"}

Pregunta del usuario: ${currentPrompt}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
      });

      if (response.text) {
        let text = response.text.trim();
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[0]);

            // Mostrar Pokémon individuales
            if (jsonData.action === "show_pokemon" && Array.isArray(jsonData.pokemon_ids)) {
              const pokemonCards = await fetchPokemonData(jsonData.pokemon_ids);
              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: jsonData.message || "Aquí están los Pokémon:",
                sender: "ai",
                timestamp: new Date(),
                pokemonCards,
              };
              setMessages((prev) => [...prev, aiMessage]);
              setIsLoading(false);
              return;
            }

            // Crear equipo Pokémon
            if (jsonData.action === "show_team" && Array.isArray(jsonData.pokemon_ids)) {
              const pokemonCards = await fetchPokemonData(jsonData.pokemon_ids);
              const teamName = jsonData.team_name || `Equipo ${Date.now()}`;
              addTeam(teamName, pokemonCards, "ai");

              const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text:
                  (jsonData.message || "Aquí está tu equipo:") +
                  `\n\n✅ Equipo "${teamName}" guardado exitosamente.`,
                sender: "ai",
                timestamp: new Date(),
                pokemonCards,
              };
              setMessages((prev) => [...prev, aiMessage]);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.log("No JSON encontrado, mostrando texto normal");
        }

        // Respuesta normal
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), text, sender: "ai", timestamp: new Date() },
        ]);
      }
    } catch (error: any) {
      console.error("Error completo:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `❌ Error: ${error.message || "No pude procesar tu mensaje"}. Verifica tu API key.`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = [
    "Muéstrame 5 Pokémon de tipo agua",
    "Crea un equipo con 6 Pokémon fuego",
    "Recomiéndame un equipo legendario",
    "Busca los iniciales de Kanto",
  ];

  const handleQuickSuggestion = (suggestion: string) => setValue(suggestion);

  return (
    <>
      {/* Botón flotante */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-2xl z-50"
        style={{
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Text className="text-3xl">😎</Text>
        {favorites.length > 0 && (
          <View className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">{favorites.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal principal */}
      <Modal visible={isOpen} animationType="slide" transparent onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 justify-end"
          >
            <View className="bg-white rounded-t-3xl h-[85%] shadow-2xl">
              {/* Header */}
              <View className="bg-blue-600 rounded-t-3xl p-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3">
                    <Text className="text-2xl">🤖</Text>
                  </View>
                  <View>
                    <Text className="text-white font-bold text-lg">PokeAI</Text>
                    <Text className="text-blue-200 text-xs">
                      {isLoading ? "Pensando..." : `${favorites.length} favoritos | ${teams.length} equipos`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full items-center justify-center"
                >
                  <Text className="text-white font-bold text-lg">✕</Text>
                </TouchableOpacity>
              </View>

              {/* Mensajes */}
              <ScrollView
                ref={scrollViewRef}
                className="flex-1 p-4 bg-gray-50"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {messages.length === 0 ? (
                  <View className="flex-1 py-10">
                    <View className="items-center mb-6">
                      <Text className="text-6xl mb-4">🤖</Text>
                      <Text className="text-xl font-bold text-gray-700 mb-2">¡Hola! Soy PokeAI</Text>
                      <Text className="text-gray-500 text-center px-8 mb-4">
                        Puedo buscar Pokémon, recomendarte equipos o crear los tuyos 🔥
                      </Text>
                      <View className="bg-blue-50 p-3 rounded-lg">
                        <Text className="text-blue-800 text-sm font-semibold text-center">
                          ⭐ {favorites.length} favoritos | 🧩 {teams.length} equipos
                        </Text>
                      </View>
                    </View>

                    <View className="px-4">
                      <Text className="text-sm text-gray-500 mb-2 font-semibold">💡 Prueba preguntarme:</Text>
                      {quickSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleQuickSuggestion(suggestion)}
                          className="bg-white p-3 rounded-xl mb-2 border border-gray-200"
                        >
                          <Text className="text-gray-700">{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ) : (
                  messages.map((msg) => (
                    <View key={msg.id} className={`mb-3 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <View
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.sender === "user"
                            ? "bg-blue-600 rounded-br-sm"
                            : "bg-white rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <Text
                          className={`${
                            msg.sender === "user" ? "text-white" : "text-gray-800"
                          } leading-5`}
                        >
                          {msg.text}
                        </Text>
                      </View>

                      {/* Mostrar Pokémon */}
                      {msg.pokemonCards && msg.pokemonCards.length > 0 && (
                        <View className="mt-2 w-full">
                          {msg.pokemonCards.map((pokemon) => (
                            <View
                              key={pokemon.id}
                              className="bg-white rounded-xl p-3 mb-2 shadow-sm flex-row items-center"
                            >
                              <Image
                                source={{ uri: pokemon.imageUrl }}
                                className="w-16 h-16"
                                resizeMode="contain"
                              />
                              <View className="flex-1 ml-3">
                                <Text className="font-bold text-gray-800 capitalize text-base">
                                  {pokemon.name}
                                </Text>
                                <Text className="text-xs text-gray-500 mb-1">
                                  #{pokemon.id.toString().padStart(3, "0")}
                                </Text>
                                <View className="flex-row flex-wrap">
                                  {pokemon.types.map((type, idx) => (
                                    <View
                                      key={idx}
                                      className="px-2 py-1 rounded-full mr-1 mb-1"
                                      style={{ backgroundColor: getTypeColor(type) }}
                                    >
                                      <Text className="text-white text-xs font-semibold capitalize">
                                        {type}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))
                )}

                {isLoading && (
                  <View className="items-start mb-3">
                    <View className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm">
                      <ActivityIndicator size="small" color="#2563eb" />
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View className="border-t border-gray-200 p-4 bg-white">
                <View className="flex-row items-end">
                  <View className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 mr-2 min-h-[44px] justify-center">
                    <TextInput
                      placeholder="Ej: crea un equipo con 6 Pokémon fuego..."
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={setValue}
                      multiline
                      maxLength={500}
                      style={{ maxHeight: 100 }}
                      onSubmitEditing={sendMessage}
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={sendMessage}
                    disabled={isLoading || !value.trim()}
                    className={`w-11 h-11 rounded-full items-center justify-center shadow-md ${
                      isLoading || !value.trim() ? "bg-gray-300" : "bg-blue-600"
                    }`}
                  >
                    <Text className="text-white font-bold text-lg">
                      {isLoading ? "..." : "➤"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}