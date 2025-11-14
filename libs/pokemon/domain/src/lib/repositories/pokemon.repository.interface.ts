import { Pokemon } from '../entities/pokemon.entity';

export interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findById(id: number): Promise<Pokemon | null>;
  create(pokemon: Pokemon): Promise<Pokemon>;
}
