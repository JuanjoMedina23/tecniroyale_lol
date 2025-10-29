import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Link } from "expo-router";
import { useFavorites } from "../context/FavoritesContext";
import TypeBadge from "../components/TypeBadge";

export default function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavorites();

  const FavoriteCard = ({ item }: any) => {
    return (
      <View className="bg-white rounded-xl p-4 mb-3 shadow-md">
        <View className="flex-row items-center">
          <Image source={{ uri: item.imageUrl }} className="w-20 h-20 mr-4" />
          
          <View className="flex-1">
            <Text className="text-xl font-bold capitalize mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-neutral-500 mb-2">
              #{item.id.toString().padStart(3, "0")}
            </Text>
            
            <View className="flex-row flex-wrap">
              {item.types.map((type: string, i: number) => (
                <TypeBadge key={i} type={type} size="sm" />
              ))}
            </View>
          </View>

          <View className="items-end">
            <TouchableOpacity
              onPress={() => removeFavorite(item.id)}
              className="bg-red-500 p-2 rounded-lg mb-2"
            >
              <Text className="text-xl">🗑️</Text>
            </TouchableOpacity>
            
            <Link href={`/details/${item.id}` as any} asChild>
              <TouchableOpacity className="bg-blue-500 px-3 py-2 rounded-lg">
                <Text className="text-white text-xs font-semibold">Ver</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-red-600">
      {/* Header */}
      <View className="bg-red-600 p-6 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-4xl mr-3">❤️</Text>
            <View>
              <Text className="text-3xl font-bold text-white">Favoritos</Text>
              <Text className="text-white text-sm opacity-90">
                {favorites.length} Pokémon guardados
              </Text>
            </View>
          </View>
          
          <Link href="/" asChild>
            <TouchableOpacity className="bg-white px-4 py-2 rounded-lg">
              <Text className="text-red-600 font-semibold">← Volver</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 bg-neutral-100 px-4 pt-4">
        {favorites.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">💔</Text>
            <Text className="text-xl font-bold text-neutral-700 mb-2">
              No hay favoritos
            </Text>
            <Text className="text-neutral-500 text-center px-8">
              Agrega Pokémon a favoritos desde la búsqueda o detalles
            </Text>
            
            <Link href="/" asChild>
              <TouchableOpacity className="bg-red-600 px-6 py-3 rounded-xl mt-6">
                <Text className="text-white font-bold">Buscar Pokémon</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <FlatList
            data={favorites}
            renderItem={({ item }) => <FavoriteCard item={item} />}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}