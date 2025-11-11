// PokeAI.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Constants from "expo-constants";
import { GoogleGenAI } from "@google/genai";
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
import { getTypeColor } from "@/components/ui/CustomColor";

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

  // ---------------------------
  // CARGA DE LA API KEY (segura)
  // ---------------------------
  // Recomendado: define EXPO_PUBLIC_GEMINI_API_KEY en .env y mapea en app.config.js a extra.GEMINI_API_KEY
  // Luego expo-constants puede leerla con expoConfig.extra.GEMINI_API_KEY
  const APIKEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

  // Aviso en consola (útil para debugar)
  useEffect(() => {
    console.log("Gemini API Key cargada?:", APIKEY ? "✔️" : "❌ (no encontrada)");
  }, [APIKEY]);

  // Crear cliente solo una vez para evitar múltiples instancias
  const ai = useMemo(() => {
    if (!APIKEY) return null;
    try {
      return new GoogleGenAI({ apiKey: APIKEY });
    } catch (err) {
      console.error("Error creando cliente GoogleGenAI:", err);
      return null;
    }
  }, [APIKEY]);

  // Auto scroll
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages, isLoading]);

  // ---------------------------
  // Función para obtener datos Pokémon
  // ---------------------------
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
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((p): p is PokemonCard => p !== null);
  };

  // ---------------------------
  // sendMessage optimizada
  // ---------------------------
  const sendMessage = async () => {
    if (!value.trim()) return;

    if (!ai) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "❌ Error: API key no configurada o cliente no inicializado. Revisa tu configuración.",
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
      // 1) LIMITAR contexto (para ahorrar tokens)
      const limitedFavorites = favorites.slice(0, 3);
      const limitedTeams = teams.slice(0, 2);

      const favoritesInfo =
        limitedFavorites.length > 0
          ? limitedFavorites.map((f) => `${f.name} (${f.types.join(", ")})`).join("; ")
          : "Sin favoritos.";
      const equiposInfo =
        limitedTeams.length > 0
          ? limitedTeams
              .map((t) => `${t.name} (${t.pokemons.map((p) => p.name).join(", ")})`)
              .join("; ")
          : "Sin equipos.";

      // 2) PROMPT simple y directo
      const prompt = `
Eres un asistente experto en Pokémon. Responde de forma concisa.
Favoritos: ${favoritesInfo}
Equipos: ${equiposInfo}

Reglas:
1) Si el usuario pide mostrar Pokémon, responde SOLO con JSON:
   {"action":"show_pokemon","pokemon_ids":[1,2,3],"message":"..."}
2) Si pide crear/recomendar equipo:
   {"action":"show_team","team_name":"Nombre","pokemon_ids":[4,5,6],"message":"..."}
Si no es una petición JSON, responde en texto breve.

Pregunta: ${currentPrompt}
`.trim();

      // 3) Llamada al modelo (usar modelo estable y corto si disponible)
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = (response.text || "").trim();

      if (!text) {
        throw new Error("Respuesta vacía del modelo");
      }

      // 4) Intentar extraer JSON si el modelo devolvió uno
      let handled = false;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);

          // Mostrar Pokémon individuales
          if (jsonData.action === "show_pokemon" && Array.isArray(jsonData.pokemon_ids)) {
            const pokemonCards = await fetchPokemonData(jsonData.pokemon_ids);
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                text: jsonData.message || "Aquí están los Pokémon:",
                sender: "ai",
                timestamp: new Date(),
                pokemonCards,
              },
            ]);
            handled = true;
          }

          // Crear equipo Pokémon
          if (jsonData.action === "show_team" && Array.isArray(jsonData.pokemon_ids)) {
            const pokemonCards = await fetchPokemonData(jsonData.pokemon_ids);
            const teamName = jsonData.team_name || `Equipo ${Date.now()}`;
            addTeam(teamName, pokemonCards, "ai");
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                text: `${jsonData.message || "Aquí está tu equipo:"}\n✅ Equipo "${teamName}" guardado.`,
                sender: "ai",
                timestamp: new Date(),
                pokemonCards,
              },
            ]);
            handled = true;
          }
        }
      } catch (err) {
        console.log("No se pudo parsear JSON del modelo (puede que devolviera texto).", err);
      }

      // 5) Si no fue manejado como JSON, mostrar texto normal (corto)
      if (!handled) {
        // Cortar la respuesta si es muy larga (previene gasto extra si la app intenta procesarla)
        const MAX_LEN = 1200;
        const truncated = text.length > MAX_LEN ? text.slice(0, MAX_LEN) + "…" : text;

        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), text: truncated, sender: "ai", timestamp: new Date() },
        ]);
      }
    } catch (error: any) {
      console.error("Error en sendMessage:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: `❌ Error: ${error.message || "No pude procesar tu mensaje"}.`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestions (sin cambio)
  const quickSuggestions = [
    "Muéstrame 5 Pokémon de tipo agua",
    "Crea un equipo con 6 Pokémon fuego",
    "Recomiéndame un equipo legendario",
    "Busca los iniciales de Kanto",
  ];

  const handleQuickSuggestion = (suggestion: string) => setValue(suggestion);

  // ---------------------------
  // Render UI (sin cambios funcionales importantes)
  // ---------------------------
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
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end">
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
              <ScrollView ref={scrollViewRef} className="flex-1 p-4 bg-gray-50" contentContainerStyle={{ paddingBottom: 20 }}>
                {messages.length === 0 ? (
                  <View className="flex-1 py-10">
                    <View className="items-center mb-6">
                      <Text className="text-6xl mb-4">🤖</Text>
                      <Text className="text-xl font-bold text-gray-700 mb-2">¡Hola! Soy PokeAI</Text>
                      <Text className="text-gray-500 text-center px-8 mb-4">
                        Puedo buscar Pokémon, recomendarte equipos o crear los tuyos 🔥
                      </Text>
                      <View className="bg-blue-50 p-3 rounded-lg">
                        <Text className="text-blue-800 text-sm font-semibold text-center">⭐ {favorites.length} favoritos | 🧩 {teams.length} equipos</Text>
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
                          msg.sender === "user" ? "bg-blue-600 rounded-br-sm" : "bg-white rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <Text className={`${msg.sender === "user" ? "text-white" : "text-gray-800"} leading-5`}>{msg.text}</Text>
                      </View>

                      {/* Mostrar Pokémon */}
                      {msg.pokemonCards && msg.pokemonCards.length > 0 && (
                        <View className="mt-2 w-full">
                          {msg.pokemonCards.map((pokemon) => (
                            <View key={pokemon.id} className="bg-white rounded-xl p-3 mb-2 shadow-sm flex-row items-center">
                              <Image source={{ uri: pokemon.imageUrl }} className="w-16 h-16" resizeMode="contain" />
                              <View className="flex-1 ml-3">
                                <Text className="font-bold text-gray-800 capitalize text-base">{pokemon.name}</Text>
                                <Text className="text-xs text-gray-500 mb-1">#{pokemon.id.toString().padStart(3, "0")}</Text>
                                <View className="flex-row flex-wrap">
                                  {pokemon.types.map((type, idx) => (
                                    <View key={idx} className="px-2 py-1 rounded-full mr-1 mb-1" style={{ backgroundColor: getTypeColor(type) }}>
                                      <Text className="text-white text-xs font-semibold capitalize">{type}</Text>
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

                  <TouchableOpacity onPress={sendMessage} disabled={isLoading || !value.trim()} className={`w-11 h-11 rounded-full items-center justify-center shadow-md ${isLoading || !value.trim() ? "bg-gray-300" : "bg-blue-600"}`}>
                    <Text className="text-white font-bold text-lg">{isLoading ? "..." : "➤"}</Text>
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
