import { Pokemon, IPokemonRepository } from '@pokedex-app/domain';

export class ListPokemonsUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async execute(): Promise<Pokemon[]> {
    return await this.pokemonRepository.findAll();
  }
}
