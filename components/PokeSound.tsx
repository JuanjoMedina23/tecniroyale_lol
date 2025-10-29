import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, View, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";

type PokeSoundProps = {
  pokemonId: number;
  pokemonName: string;
};

export default function PokeSound({ pokemonId, pokemonName }: PokeSoundProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: detener y descargar el sonido cuando se desmonte el componente
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function playSound() {
    try {
      setIsLoading(true);

      // Si ya hay un sonido cargado, solo reproducirlo
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (isPlaying) {
            await sound.stopAsync();
            await sound.setPositionAsync(0);
            setIsPlaying(false);
          } else {
            await sound.playAsync();
            setIsPlaying(true);
          }
        }
        setIsLoading(false);
        return;
      }

      // Configurar el modo de audio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // URL del sonido del Pokémon (desde PokeAPI)
      const soundUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemonId}.ogg`;

      // Crear y cargar el sonido
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: soundUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error reproduciendo sonido:", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }

  function onPlaybackStatusUpdate(status: any) {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    } else if (status.error) {
      console.error("Error en reproducción:", status.error);
      setIsPlaying(false);
    }
  }

  return (
    <TouchableOpacity
      onPress={playSound}
      disabled={isLoading}
      className={`${
        isPlaying
          ? "bg-green-500"
          : isLoading
          ? "bg-gray-400"
          : "bg-blue-500"
      } px-6 py-3 rounded-xl shadow-md flex-row items-center justify-center`}
    >
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color="white" />
          <Text className="text-white font-bold ml-2">Cargando...</Text>
        </>
      ) : (
        <>
          <Text className="text-2xl mr-2">{isPlaying ? "🔊" : "🔇"}</Text>
          <Text className="text-white font-bold">
            {isPlaying ? "Reproduciendo..." : "Escuchar Grito"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}