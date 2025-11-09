import { Injectable, Inject } from '@nestjs/common';
import { IPokemonRepository } from '@pokedex-app/domain';
import {
  ListPokemonsUseCase,
  GetPokemonByIdUseCase,
} from '@pokedex-app/application';
import { PokemonDto } from '@pokedex-app/contracts';

@Injectable()
export class PokemonService {
  constructor(
    @Inject('IPokemonRepository')
    private readonly pokemonRepository: IPokemonRepository
  ) {}

  async getAllPokemons(): Promise<PokemonDto[]> {
    const useCase = new ListPokemonsUseCase(this.pokemonRepository);
    const pokemons = await useCase.execute();

    // Map domain entities to DTOs
    return pokemons.map((p) => ({
      id: p.id,
      name: p.name,
      types: p.types.map((t) => t.toString()),
      height: p.height,
      weight: p.weight,
      imageUrl: p.imageUrl,
    }));
  }

  async getPokemonById(id: number): Promise<PokemonDto | null> {
    const useCase = new GetPokemonByIdUseCase(this.pokemonRepository);
    const pokemon = await useCase.execute(id);

    if (!pokemon) return null;

    // Map domain entity to DTO
    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map((t) => t.toString()),
      height: pokemon.height,
      weight: pokemon.weight,
      imageUrl: pokemon.imageUrl,
    };
  }
}
