import {
  Trainer,
  ITrainerRepository,
  IPokemonPort,
  PokemonBasicInfo,
} from '@pokedex-app/trainer-domain';

// Return type with combined data from both domains
export interface TrainerWithFavorites {
  trainer: Trainer;
  favoritePokemons: PokemonBasicInfo[];
}

export class GetTrainerWithFavoritesUseCase {
  constructor(
    private readonly trainerRepository: ITrainerRepository,
    private readonly pokemonPort: IPokemonPort // Cross-domain port
  ) {}

  async execute(trainerId: number): Promise<TrainerWithFavorites | null> {
    const trainer = await this.trainerRepository.findById(trainerId);

    if (!trainer) {
      return null;
    }

    // Get Pokemon details through the port
    const favoritePokemons = await this.pokemonPort.getMultipleBasicInfo(
      Array.from(trainer.getFavoritePokemonIds())
    );

    return {
      trainer,
      favoritePokemons,
    };
  }
}
