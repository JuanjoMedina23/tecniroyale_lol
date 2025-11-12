import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { getTypeColor } from "@/components/ui/CustomColor";
import { useFavorites } from "@/context/FavoritesContext";
import { useEquipos } from "@/context/EquipoContext";

type Pokemon = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
};

type PokeEquipoProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PokeEquipo({ isOpen, onClose }: PokeEquipoProps) {
  const { teams, addTeam, removeTeam, clearTeams, removePokemonFromTeam, renameTeam } = useEquipos();
  const { addFavorite } = useFavorites();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renameTeamId, setRenameTeamId] = useState<string>("");
  const [newTeamName, setNewTeamName] = useState("");
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set());

  const openCreateModal = () => {
    setTeamName("");
    setCreateModalVisible(true);
  };

  const saveTeam = () => {
    if (!teamName.trim()) {
      Alert.alert("Error", "Debes ingresar un nombre para el equipo");
      return;
    }
    addTeam(teamName.trim(), [], "user");
    setCreateModalVisible(false);
    Alert.alert(
      "Equipo Creado",
      `"${teamName}" está listo. Ahora puedes agregar Pokémon desde sus detalles.`
    );
  };

  const handleDeleteTeam = (id: string, name: string) => {
    setMenuVisible(null);
    setTimeout(() => {
      Alert.alert(
        "Eliminar Equipo",
        `¿Estás seguro de eliminar "${name}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => removeTeam(id),
          },
        ]
      );
    }, 100);
  };

  const handleRemovePokemon = (teamId: string, pokemonId: number, pokemonName: string) => {
    Alert.alert(
      "Quitar del Equipo",
      `¿Quitar a ${pokemonName} del equipo?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: () => {
            const success = removePokemonFromTeam(teamId, pokemonId);
            if (success) {
              Alert.alert("💔 Removido", `${pokemonName} fue quitado del equipo`);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (teams.length === 0) return;
    
    Alert.alert(
      "Eliminar Todos",
      "¿Estás seguro de eliminar todos tus equipos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar Todos",
          style: "destructive",
          onPress: clearTeams,
        },
      ]
    );
  };

  const handleAddFavorite = (pokemon: Pokemon) => {
    try {
      addFavorite(pokemon);
      Alert.alert("💖 Agregado", `${pokemon.name} fue agregado a favoritos`);
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar a favoritos");
    }
  };

  const toggleMenu = (teamId: string) => {
    setMenuVisible(menuVisible === teamId ? null : teamId);
  };

  const closeMenu = () => {
    setMenuVisible(null);
  };

  const handleRenameTeam = (id: string, currentName: string) => {
    setMenuVisible(null);
    setRenameTeamId(id);
    setNewTeamName(currentName);
    setRenameModalVisible(true);
  };

  const saveRename = () => {
    if (!newTeamName.trim()) {
      Alert.alert("Error", "El nombre no puede estar vacío");
      return;
    }
    
    renameTeam(renameTeamId, newTeamName.trim());
    setRenameModalVisible(false);
    Alert.alert("✓ Renombrado", `Equipo renombrado exitosamente`);
  };

  const toggleTeamCollapse = (teamId: string) => {
    setMenuVisible(null);
    setCollapsedTeams((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  // Calcular estadísticas del equipo
  const getTeamStats = (pokemons: Pokemon[]) => {
    if (pokemons.length === 0) {
      return { uniqueTypes: 0, avgPokedexNumber: 0 };
    }
    const uniqueTypes = new Set(pokemons.flatMap((p) => p.types)).size;
    const avgPokedexNumber = Math.round(
      pokemons.reduce((acc, p) => acc + p.id, 0) / pokemons.length
    );
    return { uniqueTypes, avgPokedexNumber };
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-purple-600">
        {/* Header */}
        <View className="bg-purple-600 p-6 pb-4" style={{ zIndex: 1 }}>
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white text-3xl font-bold">⚔️ Mis Equipos</Text>
              <Text className="text-purple-200 text-sm mt-1">
                {teams.length} {teams.length === 1 ? "equipo" : "equipos"} guardados
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="bg-white/20 w-10 h-10 rounded-full items-center justify-center"
            >
              <Text className="text-white font-bold text-xl">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              className="flex-1 bg-white rounded-xl py-3"
              onPress={openCreateModal}
            >
              <Text className="text-purple-600 text-center font-semibold text-base">
                ➕ Crear Equipo
              </Text>
            </TouchableOpacity>

            {teams.length > 0 && (
              <TouchableOpacity
                onPress={handleClearAll}
                className="bg-red-500 px-4 py-3 rounded-xl"
              >
                <Text className="text-white font-semibold">🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Contenido */}
        <View className="flex-1 bg-neutral-100" style={{ zIndex: 0 }}>
          {teams.length === 0 ? (
            <View className="flex-1 items-center justify-center p-8">
              <Text className="text-6xl mb-4">📦</Text>
              <Text className="text-2xl font-bold text-neutral-700 text-center">
                No tienes equipos
              </Text>
              <Text className="text-neutral-500 mt-3 text-center">
                Crea equipos vacíos o usa PokeAI 🤖
              </Text>
              <Text className="text-neutral-400 mt-2 text-center text-sm">
                Luego agrega Pokémon desde sus detalles
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
            >
              {teams.map((team) => {
                const stats = getTeamStats(team.pokemons);
                const isFull = team.pokemons.length >= 6;
                const isMenuOpen = menuVisible === team.id;
                const isCollapsed = collapsedTeams.has(team.id);
                
                return (
                  <View
                    key={team.id}
                    className="bg-white rounded-2xl p-4 mb-4 shadow-lg"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Header del equipo */}
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1">
                        <Text className="text-xl font-bold text-neutral-800">
                          {team.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Text className="text-xs text-neutral-500">
                            {team.pokemons.length}/6 Pokémon
                          </Text>
                          <View
                            className={`ml-2 px-2 py-0.5 rounded-full ${
                              team.createdBy === "ai"
                                ? "bg-blue-100"
                                : "bg-green-100"
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                team.createdBy === "ai"
                                  ? "text-blue-700"
                                  : "text-green-700"
                              }`}
                            >
                              {team.createdBy === "ai" ? "🤖 IA" : "👤 Manual"}
                            </Text>
                          </View>
                          {isFull && (
                            <View className="ml-2 px-2 py-0.5 rounded-full bg-amber-100">
                              <Text className="text-xs font-semibold text-amber-700">
                                ✓ Completo
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      
                      {/* Botón de menú de 3 puntos */}
                      <View>
                        <TouchableOpacity
                          onPress={() => toggleMenu(team.id)}
                          className="bg-neutral-100 p-2 rounded-lg"
                        >
                          <Text className="text-neutral-600 text-lg font-bold">⋮</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Mensaje si está vacío */}
                    {!isCollapsed && team.pokemons.length === 0 ? (
                      <View className="bg-purple-50 rounded-xl p-6 items-center">
                        <Text className="text-4xl mb-2">🎯</Text>
                        <Text className="text-neutral-600 font-semibold mb-1">
                          Equipo vacío
                        </Text>
                        <Text className="text-neutral-400 text-xs text-center">
                          Ve a los detalles de un Pokémon y agrégalo aquí
                        </Text>
                      </View>
                    ) : !isCollapsed && team.pokemons.length > 0 ? (
                      <>
                        {/* Grid de Pokémon */}
                        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                          {team.pokemons.map((pokemon, index) => (
                            <View
                              key={`${pokemon.id}-${index}`}
                              className="bg-neutral-50 rounded-xl p-3"
                              style={{ width: '48%' }}
                            >
                              <View className="items-center mb-2">
                                <View className="bg-purple-100 rounded-full w-6 h-6 items-center justify-center mb-1">
                                  <Text className="text-purple-700 font-bold text-xs">
                                    {index + 1}
                                  </Text>
                                </View>
                                <Image
                                  source={{ uri: pokemon.imageUrl }}
                                  className="w-16 h-16"
                                  resizeMode="contain"
                                />
                              </View>

                              <Text className="font-bold text-neutral-800 capitalize text-center text-sm mb-1">
                                {pokemon.name}
                              </Text>
                              <Text className="text-xs text-neutral-500 text-center mb-2">
                                #{pokemon.id.toString().padStart(3, "0")}
                              </Text>

                              <View className="flex-row flex-wrap justify-center mb-2">
                                {pokemon.types.map((type, i) => (
                                  <View
                                    key={i}
                                    className="px-2 py-0.5 rounded-full mb-1"
                                    style={{ 
                                      backgroundColor: getTypeColor(type),
                                      marginRight: i < pokemon.types.length - 1 ? 4 : 0 
                                    }}
                                  >
                                    <Text className="text-white text-[10px] font-semibold capitalize">
                                      {type}
                                    </Text>
                                  </View>
                                ))}
                              </View>

                              <View className="flex-row flex-wrap" style={{ gap: 4 }}>
                                <TouchableOpacity
                                  onPress={() => handleAddFavorite(pokemon)}
                                  className="bg-red-500 px-2 py-1 rounded-lg"
                                  style={{ flex: 1 }}
                                >
                                  <Text className="text-white text-xs text-center">❤️</Text>
                                </TouchableOpacity>

                                <Link href={`/details/${pokemon.id}`} asChild>
                                  <TouchableOpacity 
                                    className="bg-purple-500 px-2 py-1 rounded-lg"
                                    style={{ flex: 1 }}
                                  >
                                    <Text className="text-white text-xs text-center">📊</Text>
                                  </TouchableOpacity>
                                </Link>

                                <TouchableOpacity
                                  onPress={() => handleRemovePokemon(team.id, pokemon.id, pokemon.name)}
                                  className="bg-orange-500 px-2 py-1 rounded-lg"
                                  style={{ flex: 1 }}
                                >
                                  <Text className="text-white text-xs text-center">✕</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ))}
                        </View>

                        {/* Stats del equipo */}
                        <View className="mt-2 pt-3 border-t border-neutral-200">
                          <View className="flex-row justify-around">
                            <View className="items-center">
                              <Text className="text-2xl">🎯</Text>
                              <Text className="text-xs text-neutral-500 mt-1">
                                Tipos únicos
                              </Text>
                              <Text className="font-bold text-neutral-800">
                                {stats.uniqueTypes}
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-2xl">⚡</Text>
                              <Text className="text-xs text-neutral-500 mt-1">
                                Total
                              </Text>
                              <Text className="font-bold text-neutral-800">
                                {team.pokemons.length}/6
                              </Text>
                            </View>
                            <View className="items-center">
                              <Text className="text-2xl">📍</Text>
                              <Text className="text-xs text-neutral-500 mt-1">
                                N° Promedio
                              </Text>
                              <Text className="font-bold text-neutral-800">
                                {stats.avgPokedexNumber}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    ) : null}

                    {/* Indicador de equipo colapsado */}
                    {isCollapsed && team.pokemons.length > 0 && (
                      <View className="bg-neutral-50 rounded-xl p-4 items-center">
                        <Text className="text-neutral-500 text-sm">
                          👁️ Equipo oculto ({team.pokemons.length} Pokémon)
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Modal de menú flotante */}
        <Modal
          visible={menuVisible !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={1}
            onPress={closeMenu}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 0,
                minWidth: 200,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              {menuVisible && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      const team = teams.find(t => t.id === menuVisible);
                      if (team) {
                        handleRenameTeam(team.id, team.name);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f3f4f6',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20, marginRight: 12 }}>✏️</Text>
                    <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 16 }}>
                      Renombrar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const team = teams.find(t => t.id === menuVisible);
                      if (team) {
                        toggleTeamCollapse(team.id);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f3f4f6',
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20, marginRight: 12 }}>
                      {collapsedTeams.has(menuVisible) ? '👁️' : '🙈'}
                    </Text>
                    <Text style={{ color: '#6b7280', fontWeight: '600', fontSize: 16 }}>
                      {collapsedTeams.has(menuVisible) ? 'Mostrar' : 'Ocultar'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const team = teams.find(t => t.id === menuVisible);
                      if (team) {
                        handleDeleteTeam(team.id, team.name);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 16,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20, marginRight: 12 }}>🗑️</Text>
                    <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 16 }}>
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>

      {/* Modal para crear equipo vacío */}
      <Modal visible={createModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold mb-2 text-center">Nuevo Equipo</Text>
            <Text className="text-sm text-gray-500 mb-4 text-center">
              Crea un equipo vacío (máx. 6 Pokémon)
            </Text>
            
            <TextInput
              placeholder="Nombre del equipo (ej: Equipo Fuego)"
              value={teamName}
              onChangeText={setTeamName}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
              maxLength={30}
            />

            <Text className="text-xs text-gray-400 mb-4 text-center">
              💡 Agrega Pokémon desde sus detalles o usa PokeAI
            </Text>

            <TouchableOpacity
              className="bg-purple-500 rounded-xl py-3 mb-2"
              onPress={saveTeam}
            >
              <Text className="text-white text-center font-semibold text-base">
                ✓ Crear Equipo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-300 rounded-xl py-3"
              onPress={() => setCreateModalVisible(false)}
            >
              <Text className="text-gray-700 text-center font-semibold text-base">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para renombrar equipo */}
      <Modal visible={renameModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center bg-black/50 px-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-xl font-bold mb-2 text-center">✏️ Renombrar Equipo</Text>
            <Text className="text-sm text-gray-500 mb-4 text-center">
              Ingresa el nuevo nombre para el equipo
            </Text>
            
            <TextInput
              placeholder="Nuevo nombre del equipo"
              value={newTeamName}
              onChangeText={setNewTeamName}
              className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
              maxLength={30}
              autoFocus
            />

            <TouchableOpacity
              className="bg-blue-500 rounded-xl py-3 mb-2"
              onPress={saveRename}
            >
              <Text className="text-white text-center font-semibold text-base">
                ✓ Guardar Cambios
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-gray-300 rounded-xl py-3"
              onPress={() => setRenameModalVisible(false)}
            >
              <Text className="text-gray-700 text-center font-semibold text-base">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}