import { IPokemonPort, PokemonBasicInfo } from '@pokedex-app/trainer-domain';
import { IPokemonRepository } from '@pokedex-app/pokemon-domain';

// Adapter: Implements Trainer's port using Pokemon's repository
export class PokemonAdapter implements IPokemonPort {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async exists(pokemonId: number): Promise<boolean> {
    const pokemon = await this.pokemonRepository.findById(pokemonId);
    return pokemon !== null;
  }

  async getBasicInfo(pokemonId: number): Promise<PokemonBasicInfo | null> {
    const pokemon = await this.pokemonRepository.findById(pokemonId);

    if (!pokemon) {
      return null;
    }

    // Map Pokemon entity to the simple DTO that Trainer needs
    return {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: pokemon.imageUrl,
      types: pokemon.types.map((t) => t.toString()),
    };
  }

  async getMultipleBasicInfo(
    pokemonIds: number[]
  ): Promise<PokemonBasicInfo[]> {
    const allPokemons = await this.pokemonRepository.findAll();

    return allPokemons
      .filter((p) => pokemonIds.includes(p.id))
      .map((pokemon) => ({
        id: pokemon.id,
        name: pokemon.name,
        imageUrl: pokemon.imageUrl,
        types: pokemon.types.map((t) => t.toString()),
      }));
  }
}
