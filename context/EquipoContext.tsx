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
  addPokemonToTeam: (teamId: string, pokemon: Pokemon) => boolean;
  removePokemonFromTeam: (teamId: string, pokemonId: number) => boolean;
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

  const addPokemonToTeam = (teamId: string, pokemon: Pokemon): boolean => {
    let success = false;

    setTeams((prev) => {
      const teamIndex = prev.findIndex((t) => t.id === teamId);
      
      if (teamIndex === -1) {
        // Equipo no encontrado
        return prev;
      }

      const team = prev[teamIndex];

      // Validaciones
      if (team.pokemons.length >= 6) {
        // Equipo lleno
        return prev;
      }

      if (team.pokemons.some((p) => p.id === pokemon.id)) {
        // Pokémon ya existe en el equipo
        return prev;
      }

      // Agregar Pokémon al equipo
      const updatedTeam = {
        ...team,
        pokemons: [...team.pokemons, pokemon],
      };

      success = true;
      return [
        ...prev.slice(0, teamIndex),
        updatedTeam,
        ...prev.slice(teamIndex + 1),
      ];
    });

    return success;
  };

  const removePokemonFromTeam = (teamId: string, pokemonId: number): boolean => {
    let success = false;

    setTeams((prev) => {
      const teamIndex = prev.findIndex((t) => t.id === teamId);
      
      if (teamIndex === -1) {
        return prev;
      }

      const team = prev[teamIndex];
      const pokemonIndex = team.pokemons.findIndex((p) => p.id === pokemonId);

      if (pokemonIndex === -1) {
        // Pokémon no encontrado en el equipo
        return prev;
      }

      // Remover Pokémon del equipo
      const updatedTeam = {
        ...team,
        pokemons: team.pokemons.filter((p) => p.id !== pokemonId),
      };

      success = true;
      return [
        ...prev.slice(0, teamIndex),
        updatedTeam,
        ...prev.slice(teamIndex + 1),
      ];
    });

    return success;
  };

  return (
    <EquipoContext.Provider 
      value={{ 
        teams, 
        addTeam, 
        removeTeam, 
        clearTeams, 
        addPokemonToTeam,
        removePokemonFromTeam 
      }}
    >
      {children}
    </EquipoContext.Provider>
  );
};

export const useEquipos = () => {
  const context = useContext(EquipoContext);
  if (!context) throw new Error("useEquipos debe usarse dentro de EquipoProvider");
  return context;
};