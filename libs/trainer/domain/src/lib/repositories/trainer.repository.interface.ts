import { Trainer } from '../entities/trainer.entity';

export interface ITrainerRepository {
  findAll(): Promise<Trainer[]>;
  findById(id: number): Promise<Trainer | null>;
  create(trainer: Trainer): Promise<Trainer>;
  update(trainer: Trainer): Promise<Trainer>;
  delete(id: number): Promise<void>;
}
