import { Trainer, ITrainerRepository } from '@pokedex-app/trainer-domain';

export class ListTrainersUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(): Promise<Trainer[]> {
    return await this.trainerRepository.findAll();
  }
}
