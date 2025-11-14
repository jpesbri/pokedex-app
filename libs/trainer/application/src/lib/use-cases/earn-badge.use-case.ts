import {
  Trainer,
  ITrainerRepository,
  TrainerBadge,
} from '@pokedex-app/trainer-domain';

export class EarnBadgeUseCase {
  constructor(private readonly trainerRepository: ITrainerRepository) {}

  async execute(trainerId: number, badge: TrainerBadge): Promise<Trainer> {
    const trainer = await this.trainerRepository.findById(trainerId);

    if (!trainer) {
      throw new Error('Trainer not found');
    }

    // Domain logic handles validation
    trainer.addBadge(badge);

    return await this.trainerRepository.update(trainer);
  }
}
