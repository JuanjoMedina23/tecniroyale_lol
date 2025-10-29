import React from "react";
import { View, Text } from "react-native";

type InfoCardProps = {
  title: string;
  icon?: string;
  children: React.ReactNode;
};

export default function InfoCard({ title, icon, children }: InfoCardProps) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
      <Text className="text-lg font-bold mb-3 text-red-600">
        {icon && `${icon} `}{title}
      </Text>
      {children}
    </View>
  );
}