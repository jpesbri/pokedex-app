import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  async findAll() {
    return await this.pokemonService.getAllPokemons();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const pokemon = await this.pokemonService.getPokemonById(+id);
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
    return pokemon;
  }
}
