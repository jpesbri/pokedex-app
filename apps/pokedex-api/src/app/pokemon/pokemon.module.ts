import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';
import { InMemoryPokemonRepository } from '@pokedex-app/pokemon-adapters';

@Module({
  controllers: [PokemonController],
  providers: [
    PokemonService,
    {
      provide: 'IPokemonRepository',
      useClass: InMemoryPokemonRepository,
    },
  ],
})
export class PokemonModule {}
