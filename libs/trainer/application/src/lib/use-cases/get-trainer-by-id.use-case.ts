import { Trainer, ITrainerRepository } from '@pokedex-app/trainer-domain';

export class GetTrainerByIdUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(id: number): Promise<Trainer | null> {
    return await this.trainerRepository.findById(id);
  }
}
