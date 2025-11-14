import { Pokemon, IPokemonRepository } from '@pokedex-app/pokemon-domain';

export class ListPokemonsUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async execute(): Promise<Pokemon[]> {
    return await this.pokemonRepository.findAll();
  }
}
