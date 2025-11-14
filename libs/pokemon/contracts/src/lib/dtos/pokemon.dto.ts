export interface PokemonDto {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  imageUrl: string;
}

export interface CreatePokemonDto {
  name: string;
  types: string[];
  height: number;
  weight: number;
  imageUrl: string;
}
