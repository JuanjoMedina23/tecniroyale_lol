import React from "react";
import { View, Text } from "react-native";

type StatBarProps = {
  name: string;
  value: number;
  maxValue?: number;
};

export default function StatBar({ name, value, maxValue = 255 }: StatBarProps) {
  const percentage = (value / maxValue) * 100;

  const getStatColor = () => {
    if (value >= 100) return "bg-green-500";
    if (value >= 70) return "bg-blue-500";
    if (value >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatStatName = (statName: string) => {
    return statName
      .replace("hp", "HP")
      .replace("special-attack", "At. Especial")
      .replace("special-defense", "Def. Especial")
      .replace("attack", "Ataque")
      .replace("defense", "Defensa")
      .replace("speed", "Velocidad");
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="capitalize font-semibold text-neutral-700">
          {formatStatName(name)}
        </Text>
        <Text className="font-bold text-red-600">{value}</Text>
      </View>
      <View className="h-3 bg-neutral-200 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${getStatColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}