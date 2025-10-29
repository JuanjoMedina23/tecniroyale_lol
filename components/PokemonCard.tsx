import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PokemonImage from "./PokemonImage";

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
        <PokemonImage pokemonId={Number(id)} size={80} />
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