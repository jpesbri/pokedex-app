import { Trainer, ITrainerRepository } from '@pokedex-app/trainer-domain';

export class AddFavoritePokemonUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(trainerId: number, pokemonId: number): Promise<Trainer> {
    const trainer = await this.trainerRepository.findById(trainerId);

    if (!trainer) {
      throw new Error('Trainer not found');
    }

    // Domain logic handles validation
    trainer.addFavoritePokemon(pokemonId);

    return await this.trainerRepository.update(trainer);
  }
}
