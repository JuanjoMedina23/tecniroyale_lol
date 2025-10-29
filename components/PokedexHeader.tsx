import React from "react";
import { View, Text } from "react-native";

type PokedexHeaderProps = {
  title?: string;
  subtitle?: string;
};

export default function PokedexHeader({
  title = "Pokédex",
  subtitle = "Primera Generación",
}: PokedexHeaderProps) {
  return (
    <View className="flex-row items-center mb-4">
      <View className="w-16 h-16 bg-white rounded-full items-center justify-center mr-3 shadow-lg">
        <View className="w-12 h-12 bg-blue-400 rounded-full border-4 border-blue-600" />
      </View>
      <View>
        <Text className="text-3xl font-bold text-white">{title}</Text>
        <Text className="text-white text-sm opacity-90">{subtitle}</Text>
      </View>
    </View>
  );
}