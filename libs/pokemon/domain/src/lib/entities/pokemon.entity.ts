import { PokemonType } from '../value-objects/pokemon-type.enum';

export class Pokemon {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly types: PokemonType[],
    public readonly height: number,
    public readonly weight: number,
    public readonly imageUrl: string
  ) {}

  // Domain logic methods
  hasType(type: PokemonType): boolean {
    return this.types.includes(type);
  }

  isHeavy(): boolean {
    return this.weight > 100;
  }
}
