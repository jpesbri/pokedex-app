import {
  Trainer,
  ITrainerRepository,
  IPokemonPort,
} from '@pokedex-app/trainer-domain';

export class AddFavoritePokemonUseCase {
  constructor(
    private readonly trainerRepository: ITrainerRepository,
    private readonly pokemonPort: IPokemonPort // Port for cross-domain communication
  ) {}

  async execute(trainerId: number, pokemonId: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findById(trainerId);

    if (!trainer) {
      throw new Error('Trainer not found');
    }

    // Validate Pokemon exists using the port
    const pokemonExists = await this.pokemonPort.exists(pokemonId);
    if (!pokemonExists) {
      throw new Error('Pokemon not found');
    }

    // Domain logic handles validation (max 6, no duplicates)
    trainer.addFavoritePokemon(pokemonId);

    return await this.trainerRepository.update(trainer);
  }
}
