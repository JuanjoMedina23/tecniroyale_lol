import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

type PokemonCardProps = {
  name: string;
  url: string;
  onPress: () => void;
};

export default function PokemonCard({ name, url, onPress }: PokemonCardProps) {
  const id = url.split("/").filter(Boolean).pop();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] bg-white rounded-xl p-3 mb-3 shadow-sm"
    >
      <View className="items-center">
        <Image
          source={{
            uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          }}
          className="w-20 h-20"
        />
        <Text className="text-xs text-neutral-400 mt-1">
          #{id?.padStart(3, "0")}
        </Text>
        <Text className="text-base font-semibold capitalize text-center">
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
}