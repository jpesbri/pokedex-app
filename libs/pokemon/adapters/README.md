# Pokemon Adapters

This library contains infrastructure implementations for the Pokemon domain.

## What's Inside

- **Repository Implementations**:
  - `InMemoryPokemonRepository`: In-memory storage for testing/development
  - `DatabasePokemonRepository`: TypeORM database implementation
- **Database Entities**: TypeORM entities for persistence

## Dependencies

- Depends on: `@pokedex-app/pokemon-domain`
- Infrastructure: TypeORM, NestJS
