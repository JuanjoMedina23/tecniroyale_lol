import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Buscar Pokémon...",
}: SearchBarProps) {
  return (
    <View className="flex-row items-center space-x-2">
      <View className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          className="px-4 py-3 text-base"
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />
      </View>
      <TouchableOpacity
        className="bg-yellow-400 p-3 rounded-xl shadow-md"
        onPress={onSubmit}
      >
        <Text className="text-2xl">🔍</Text>
      </TouchableOpacity>
    </View>
  );
}