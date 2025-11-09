import { Pokemon, IPokemonRepository, PokemonType } from '@pokedex-app/domain';

export class InMemoryPokemonRepository implements IPokemonRepository {
  private pokemons: Pokemon[] = [
    new Pokemon(
      1,
      'Bulbasaur',
      [PokemonType.GRASS, PokemonType.POISON],
      7,
      69,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
    ),
    new Pokemon(
      4,
      'Charmander',
      [PokemonType.FIRE],
      6,
      85,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
    ),
    new Pokemon(
      7,
      'Squirtle',
      [PokemonType.WATER],
      5,
      90,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
    ),
    new Pokemon(
      25,
      'Pikachu',
      [PokemonType.ELECTRIC],
      4,
      60,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
    ),
  ];

  async findAll(): Promise<Pokemon[]> {
    return Promise.resolve(this.pokemons);
  }

  async findById(id: number): Promise<Pokemon | null> {
    const pokemon = this.pokemons.find((p) => p.id === id);
    return Promise.resolve(pokemon || null);
  }

  async create(pokemon: Pokemon): Promise<Pokemon> {
    this.pokemons.push(pokemon);
    return Promise.resolve(pokemon);
  }
}
