import React from "react";
import { View, Text } from "react-native";

type TypeBadgeProps = {
  type: string;
  size?: "sm" | "md" | "lg";
};

export default function TypeBadge({ type, size = "md" }: TypeBadgeProps) {
  const getTypeColor = (typeName: string) => {
    const colors: { [key: string]: string } = {
      fire: "bg-orange-500",
      water: "bg-blue-500",
      grass: "bg-green-500",
      electric: "bg-yellow-400",
      psychic: "bg-pink-500",
      ice: "bg-cyan-400",
      dragon: "bg-indigo-600",
      dark: "bg-gray-800",
      fairy: "bg-pink-300",
      normal: "bg-gray-400",
      fighting: "bg-red-600",
      flying: "bg-indigo-400",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      rock: "bg-yellow-800",
      bug: "bg-green-600",
      ghost: "bg-purple-700",
      steel: "bg-gray-500",
    };
    return colors[typeName] || "bg-gray-400";
  };

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <View className={`${getTypeColor(type)} ${sizeClasses[size]} rounded-full mr-2`}>
      <Text className="text-white font-bold capitalize">
        {type}
      </Text>
    </View>
  );
}