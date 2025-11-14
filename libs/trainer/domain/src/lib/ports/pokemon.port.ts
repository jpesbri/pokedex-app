// Port: Interface defined by Trainer domain for what it needs from Pokemon
export interface IPokemonPort {
  exists(pokemonId: number): Promise<boolean>;
  getBasicInfo(pokemonId: number): Promise<PokemonBasicInfo | null>;
  getMultipleBasicInfo(pokemonIds: number[]): Promise<PokemonBasicInfo[]>;
}

// Simple DTO - just what Trainer needs, not full Pokemon entity
export interface PokemonBasicInfo {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
}
