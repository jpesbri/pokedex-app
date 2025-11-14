import { Pokemon, IPokemonRepository } from '@pokedex-app/pokemon-domain';

export class GetPokemonByIdUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async execute(id: number): Promise<Pokemon | null> {
    return await this.pokemonRepository.findById(id);
  }
}
