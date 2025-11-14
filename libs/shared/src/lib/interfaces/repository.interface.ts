// Base repository interface that can be extended
export interface IRepository<T, ID = number> {
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}
