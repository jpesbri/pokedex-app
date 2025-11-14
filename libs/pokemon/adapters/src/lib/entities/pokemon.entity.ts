import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// This is a DATABASE entity (TypeORM/persistence)
@Entity('pokemons')
export class PokemonEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('simple-array')
  types!: string[];

  @Column()
  height!: number;

  @Column()
  weight!: number;

  @Column()
  imageUrl!: string;
}
