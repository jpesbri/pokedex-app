import { Pokemon, IPokemonRepository, PokemonType } from '@pokedex-app/domain';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PokemonEntity } from '../entities/pokemon.entity'; // TypeORM entity

@Injectable()
export class DatabasePokemonRepository implements IPokemonRepository {
  constructor(
    @InjectRepository(PokemonEntity)
    private readonly pokemonRepo: Repository<PokemonEntity>
  ) {}

  async findAll(): Promise<Pokemon[]> {
    const entities = await this.pokemonRepo.find();
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: number): Promise<Pokemon | null> {
    const entity = await this.pokemonRepo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(pokemon: Pokemon): Promise<Pokemon> {
    const entity = this.pokemonRepo.create({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map((t) => t.toString()),
      height: pokemon.height,
      weight: pokemon.weight,
      imageUrl: pokemon.imageUrl,
    });
    await this.pokemonRepo.save(entity);
    return pokemon;
  }

  // Helper to convert DB entity to domain entity
  private toDomain(entity: PokemonEntity): Pokemon {
    return new Pokemon(
      entity.id,
      entity.name,
      entity.types.map(
        (t) => PokemonType[t.toUpperCase() as keyof typeof PokemonType]
      ),
      entity.height,
      entity.weight,
      entity.imageUrl
    );
  }
}
