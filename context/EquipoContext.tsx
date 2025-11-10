import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Pokemon = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
};

type Team = {
  id: string;
  name: string;
  pokemons: Pokemon[];
  createdBy: "user" | "ai";
};

type EquipoContextType = {
  teams: Team[];
  addTeam: (name: string, pokemons: Pokemon[], createdBy: "user" | "ai") => void;
  removeTeam: (id: string) => void;
  clearTeams: () => void;
};

const EquipoContext = createContext<EquipoContextType | undefined>(undefined);

export const EquipoProvider = ({ children }: { children: React.ReactNode }) => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      const saved = await AsyncStorage.getItem("@teams");
      if (saved) setTeams(JSON.parse(saved));
    };
    loadTeams();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("@teams", JSON.stringify(teams));
  }, [teams]);

  const addTeam = (name: string, pokemons: Pokemon[], createdBy: "user" | "ai") => {
    const newTeam: Team = {
      id: Date.now().toString(),
      name,
      pokemons,
      createdBy,
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  const removeTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const clearTeams = () => {
    setTeams([]);
  };

  return (
    <EquipoContext.Provider value={{ teams, addTeam, removeTeam, clearTeams }}>
      {children}
    </EquipoContext.Provider>
  );
};

export const useEquipos = () => {
  const context = useContext(EquipoContext);
  if (!context) throw new Error("useEquipos debe usarse dentro de EquipoProvider");
  return context;
};
