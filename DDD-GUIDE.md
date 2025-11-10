# Domain-Driven Design (DDD) Guide

A comprehensive guide to understanding Domain-Driven Design concepts and how they work with Frontend Architecture Patterns.

## Table of Contents

1. [What is Domain-Driven Design?](#what-is-domain-driven-design)
2. [Core DDD Concepts](#core-ddd-concepts)
3. [DDD Layers Architecture](#ddd-layers-architecture)
4. [Frontend Architecture Patterns](#frontend-architecture-patterns)
5. [How DDD and Frontend Patterns Work Together](#how-ddd-and-frontend-patterns-work-together)
6. [Practical Examples](#practical-examples)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)
9. [Resources](#resources)

---

## What is Domain-Driven Design?

**Domain-Driven Design (DDD)** is an approach to software development that focuses on:

- 📚 **Understanding the business domain** deeply
- 🗣️ **Creating a shared language** (Ubiquitous Language) between developers and domain experts
- 🏗️ **Modeling the domain** with rich, behavior-focused objects
- 🔄 **Iteratively refining** the model based on domain insights

### Key Benefits

✅ **Better communication** - Developers and business people speak the same language  
✅ **Maintainable code** - Clear structure and responsibilities  
✅ **Testable** - Easy to test business logic in isolation  
✅ **Flexible** - Easy to change implementations without affecting business logic  
✅ **Scalable** - Clear boundaries make it easier to grow

---

## Core DDD Concepts

### 1. Entities

**Objects with unique identity that persist over time.**

#### Characteristics

- Has a **unique identifier** (ID)
- **Mutable** - can change state while maintaining identity
- Equality based on **ID**, not attributes
- Has a **lifecycle** (created, modified, deleted)

#### Example

```typescript
export class Pokemon {
  constructor(
    public readonly id: number, // ← Unique identity
    public name: string, // ← Can change
    public readonly types: PokemonType[],
    public height: number, // ← Can change
    public weight: number, // ← Can change
    public readonly imageUrl: string
  ) {}

  // Domain logic methods
  hasType(type: PokemonType): boolean {
    return this.types.includes(type);
  }

  isHeavy(): boolean {
    return this.weight > 100;
  }

  evolve(newName: string, newWeight: number): void {
    this.name = newName;
    this.weight = newWeight;
    // ID stays the same - still the same Pokemon!
  }
}
```

#### Real-World Analogy

Think of **yourself** - you're an entity:

- You have a unique ID (SSN, passport number)
- You can change (weight, hair color, address)
- But you're still **you** regardless of changes

---

### 2. Value Objects

**Objects defined entirely by their attributes, with no identity.**

#### Characteristics

- **No identity** - defined by their values
- **Immutable** - cannot be changed, create new ones instead
- Equality based on **all attributes**
- No lifecycle - they just exist

#### Example

```typescript
export enum PokemonType {
  NORMAL = 'normal',
  FIRE = 'fire',
  WATER = 'water',
  ELECTRIC = 'electric',
  GRASS = 'grass',
  // ...
}

// More complex value object
export class Stats {
  constructor(public readonly hp: number, public readonly attack: number, public readonly defense: number) {
    // Validation in constructor
    if (hp < 0 || attack < 0 || defense < 0) {
      throw new Error('Stats cannot be negative');
    }
  }

  // Methods that return NEW value objects
  increaseAttack(amount: number): Stats {
    return new Stats(this.hp, this.attack + amount, this.defense);
  }

  equals(other: Stats): boolean {
    return this.hp === other.hp && this.attack === other.attack && this.defense === other.defense;
  }
}
```

#### Real-World Analogy

Think of **money**:

- $100 is just $100 - no identity
- All $100 bills are equivalent
- You don't "change" a $100 bill to $50, you exchange it

---

### 3. Aggregates

**Cluster of domain objects treated as a single unit.**

#### Characteristics

- Has an **Aggregate Root** (main entity)
- Other objects accessed only through the root
- Maintains **consistency boundaries**
- Transactional boundary

#### Example

```typescript
// Aggregate Root
export class Trainer {
  constructor(
    public readonly id: number,
    public name: string,
    private pokemons: Pokemon[] = [] // ← Part of aggregate
  ) {}

  // Pokemons accessed ONLY through Trainer
  addPokemon(pokemon: Pokemon): void {
    if (this.pokemons.length >= 6) {
      throw new Error('Cannot carry more than 6 Pokemon');
    }
    this.pokemons.push(pokemon);
  }

  removePokemon(pokemonId: number): void {
    this.pokemons = this.pokemons.filter((p) => p.id !== pokemonId);
  }

  getPokemons(): readonly Pokemon[] {
    return this.pokemons; // Read-only access
  }

  // Enforce business rules
  canBattle(): boolean {
    return this.pokemons.length > 0 && this.pokemons.some((p) => p.health > 0);
  }
}
```

#### Real-World Analogy

Think of an **Order** (aggregate root) containing **Order Items**:

- You don't modify order items directly
- You go through the Order to add/remove items
- Order ensures total is correct, items are valid, etc.

---

### 4. Repository Pattern

**Abstraction for accessing and storing domain objects.**

#### Characteristics

- **Interface** in domain layer
- **Implementation** in infrastructure/adapters layer
- Hides data access details
- Provides collection-like API

#### Example

```typescript
// Domain Layer - Interface (Contract)
export interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findById(id: number): Promise<Pokemon | null>;
  create(pokemon: Pokemon): Promise<Pokemon>;
  update(pokemon: Pokemon): Promise<Pokemon>;
  delete(id: number): Promise<void>;
}

// Adapters Layer - In-Memory Implementation
export class InMemoryPokemonRepository implements IPokemonRepository {
  private pokemons: Pokemon[] = [];

  async findAll(): Promise<Pokemon[]> {
    return [...this.pokemons];
  }

  async findById(id: number): Promise<Pokemon | null> {
    return this.pokemons.find((p) => p.id === id) || null;
  }

  async create(pokemon: Pokemon): Promise<Pokemon> {
    this.pokemons.push(pokemon);
    return pokemon;
  }

  async update(pokemon: Pokemon): Promise<Pokemon> {
    const index = this.pokemons.findIndex((p) => p.id === pokemon.id);
    if (index >= 0) {
      this.pokemons[index] = pokemon;
    }
    return pokemon;
  }

  async delete(id: number): Promise<void> {
    this.pokemons = this.pokemons.filter((p) => p.id !== id);
  }
}

// Adapters Layer - Database Implementation
export class DatabasePokemonRepository implements IPokemonRepository {
  constructor(private db: Database) {}

  async findAll(): Promise<Pokemon[]> {
    const rows = await this.db.query('SELECT * FROM pokemons');
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number): Promise<Pokemon | null> {
    const row = await this.db.query('SELECT * FROM pokemons WHERE id = ?', [id]);
    return row ? this.toDomain(row) : null;
  }

  // ... other methods
}
```

#### Key Benefits

- ✅ **Swap implementations** without changing business logic
- ✅ **Easy testing** with mock repositories
- ✅ **Database agnostic** domain code

---

### 5. Use Cases (Application Services)

**Orchestrate domain logic to fulfill specific business operations.**

#### Characteristics

- **Single responsibility** - one use case per operation
- **No business logic** - delegates to domain objects
- Coordinates repositories and domain objects
- Transaction boundaries

#### Example

```typescript
export class CatchPokemonUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository, private readonly trainerRepository: ITrainerRepository) {}

  async execute(trainerId: number, pokemonId: number): Promise<void> {
    // 1. Get entities
    const trainer = await this.trainerRepository.findById(trainerId);
    if (!trainer) {
      throw new Error('Trainer not found');
    }

    const pokemon = await this.pokemonRepository.findById(pokemonId);
    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    // 2. Business logic (in domain entity)
    trainer.addPokemon(pokemon); // ← Domain enforces rules

    // 3. Persist changes
    await this.trainerRepository.update(trainer);
  }
}

export class ListPokemonsUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async execute(): Promise<Pokemon[]> {
    return await this.pokemonRepository.findAll();
  }
}

export class EvolvePokemonUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async execute(pokemonId: number, newName: string): Promise<Pokemon> {
    const pokemon = await this.pokemonRepository.findById(pokemonId);
    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    // Business logic in entity
    pokemon.evolve(newName, pokemon.weight + 10);

    return await this.pokemonRepository.update(pokemon);
  }
}
```

---

### 6. Domain Services

**Operations that don't naturally fit in any entity.**

#### When to Use

- Operation involves **multiple entities**
- Operation doesn't naturally belong to one entity
- Stateless operations

#### Example

```typescript
export class BattleService {
  calculateDamage(attacker: Pokemon, defender: Pokemon, move: Move): number {
    // Complex calculation involving multiple entities
    let damage = move.power * (attacker.attack / defender.defense);

    // Type effectiveness
    if (this.isEffective(move.type, defender.types)) {
      damage *= 2;
    }

    return Math.floor(damage);
  }

  private isEffective(attackType: PokemonType, defenderTypes: PokemonType[]): boolean {
    // Type chart logic
    const effectiveness = {
      [PokemonType.FIRE]: [PokemonType.GRASS, PokemonType.ICE],
      [PokemonType.WATER]: [PokemonType.FIRE, PokemonType.ROCK],
      // ...
    };

    return defenderTypes.some((type) => effectiveness[attackType]?.includes(type));
  }
}
```

---

### 7. DTOs (Data Transfer Objects)

**Simple objects for transferring data between layers.**

#### Characteristics

- **No business logic** - just data
- Used for **API communication**
- Often use primitive types (serializable)
- Different from domain entities

#### Example

```typescript
// Contracts Layer - DTO
export interface PokemonDto {
  id: number;
  name: string;
  types: string[]; // ← Primitive (not enum)
  height: number;
  weight: number;
  imageUrl: string;
}

export interface CreatePokemonDto {
  name: string;
  types: string[];
  height: number;
  weight: number;
  imageUrl: string;
  // No ID - generated by backend
}

export interface UpdatePokemonDto {
  name?: string; // ← Optional fields
  height?: number;
  weight?: number;
}

// Mapping between Domain Entity and DTO
export class PokemonMapper {
  static toDto(entity: Pokemon): PokemonDto {
    return {
      id: entity.id,
      name: entity.name,
      types: entity.types.map((t) => t.toString()),
      height: entity.height,
      weight: entity.weight,
      imageUrl: entity.imageUrl,
    };
  }

  static toDomain(dto: PokemonDto): Pokemon {
    return new Pokemon(
      dto.id,
      dto.name,
      dto.types.map((t) => PokemonType[t.toUpperCase() as keyof typeof PokemonType]),
      dto.height,
      dto.weight,
      dto.imageUrl
    );
  }
}
```

---

## DDD Layers Architecture

### Layered Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│     (UI, Controllers, API)              │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Application Layer                 │
│     (Use Cases, Services)               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Domain Layer                    │
│  (Entities, Value Objects, Interfaces)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Infrastructure Layer               │
│  (Repositories, DB, External APIs)      │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. **Domain Layer** (Core)

**Purpose:** Pure business logic

**Contains:**

- Entities
- Value Objects
- Repository Interfaces
- Domain Services
- Domain Events

**Rules:**

- ❌ No dependencies on other layers
- ❌ No framework-specific code
- ❌ No infrastructure concerns
- ✅ Pure TypeScript/JavaScript
- ✅ Highly testable

**Example Structure:**

```
libs/domain/
├── entities/
│   ├── pokemon.entity.ts
│   └── trainer.entity.ts
├── value-objects/
│   ├── pokemon-type.enum.ts
│   └── stats.vo.ts
├── repositories/
│   ├── pokemon.repository.interface.ts
│   └── trainer.repository.interface.ts
├── services/
│   └── battle.service.ts
└── events/
    └── pokemon-evolved.event.ts
```

---

#### 2. **Application Layer** (Use Cases)

**Purpose:** Orchestrate domain logic

**Contains:**

- Use Cases
- Application Services
- Command/Query handlers

**Rules:**

- ✅ Depends on Domain layer
- ❌ No infrastructure details
- ✅ Coordinates domain objects
- ✅ Defines transactions

**Example Structure:**

```
libs/application/
├── use-cases/
│   ├── list-pokemons.use-case.ts
│   ├── catch-pokemon.use-case.ts
│   └── evolve-pokemon.use-case.ts
└── services/
    └── pokemon-application.service.ts
```

---

#### 3. **Infrastructure/Adapters Layer**

**Purpose:** Technical implementations

**Contains:**

- Repository implementations
- Database code
- External API clients
- File system access
- Framework-specific code

**Rules:**

- ✅ Depends on Domain layer (implements interfaces)
- ✅ Framework-specific code allowed
- ✅ Database/API code
- ❌ No business logic

**Example Structure:**

```
libs/adapters/
├── repositories/
│   ├── pokemon-inmemory.repository.ts
│   ├── pokemon-database.repository.ts
│   └── pokemon-api.repository.ts
├── entities/
│   └── pokemon-orm.entity.ts     # TypeORM entity
└── clients/
    └── pokeapi.client.ts
```

---

#### 4. **Contracts Layer**

**Purpose:** Shared interfaces and DTOs

**Contains:**

- DTOs
- API interfaces
- Shared types

**Rules:**

- ❌ No business logic
- ❌ No dependencies
- ✅ Simple data structures
- ✅ Serializable

**Example Structure:**

```
libs/contracts/
└── dtos/
    ├── pokemon.dto.ts
    ├── trainer.dto.ts
    └── battle.dto.ts
```

---

#### 5. **Presentation Layer** (Apps)

**Purpose:** User interface and API

**Contains:**

- Controllers (NestJS)
- Components (Angular)
- API routes
- Frontend pages

**Rules:**

- ✅ Depends on Application and Contracts layers
- ✅ Handles HTTP/UI concerns
- ❌ Minimal business logic
- ✅ Maps DTOs to/from domain

---

### Dependency Flow

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure ─────┘
     (implements Domain interfaces)
```

**Key principle:** Dependencies point inward. Domain has no dependencies.

---

## Frontend Architecture Patterns

### Overview

While DDD focuses on **domain modeling**, frontend patterns focus on **UI organization**.

---

### 1. Pages (Smart Components / Containers)

**Purpose:** Route-level components that orchestrate features

#### Characteristics

- Mapped to **routes**
- **Stateful** - manages data
- Connects to **services/facades**
- Composes multiple features/components
- Handles routing logic

#### Example

```typescript
// apps/pokedex-app/src/app/pages/pokemon-list-page/pokemon-list-page.component.ts

@Component({
  selector: 'app-pokemon-list-page',
  template: `
    <app-header></app-header>

    <div class="container">
      <app-search-bar (search)="onSearch($event)"></app-search-bar>

      <app-pokemon-list [pokemons]="pokemons$ | async" [loading]="loading$ | async" (pokemonSelected)="onPokemonSelected($event)"> </app-pokemon-list>
    </div>

    <app-footer></app-footer>
  `,
})
export class PokemonListPageComponent implements OnInit {
  pokemons$ = this.pokemonFacade.pokemons$;
  loading$ = this.pokemonFacade.loading$;

  constructor(private pokemonFacade: PokemonFacade, private router: Router) {}

  ngOnInit() {
    this.pokemonFacade.loadPokemons();
  }

  onSearch(query: string) {
    this.pokemonFacade.searchPokemons(query);
  }

  onPokemonSelected(id: number) {
    this.router.navigate(['/pokemon', id]);
  }
}
```

#### Route Configuration

```typescript
// apps/pokedex-app/src/app/app.routes.ts

export const appRoutes: Route[] = [
  {
    path: '',
    component: PokemonListPageComponent,
  },
  {
    path: 'pokemon/:id',
    component: PokemonDetailPageComponent,
  },
  {
    path: 'trainer',
    component: TrainerPageComponent,
  },
];
```

---

### 2. Features (Business Feature Modules)

**Purpose:** Group related functionality by business domain

#### Characteristics

- **Domain-focused** organization
- Contains related components, services, models
- Can be **lazy-loaded**
- Encapsulates feature logic

#### Example Structure

```
apps/pokedex-app/src/app/features/
├── pokemon/
│   ├── pokemon-list/
│   │   ├── pokemon-list.component.ts
│   │   ├── pokemon-list.component.html
│   │   └── pokemon-list.component.scss
│   ├── pokemon-card/
│   │   ├── pokemon-card.component.ts
│   │   ├── pokemon-card.component.html
│   │   └── pokemon-card.component.scss
│   ├── pokemon-detail/
│   │   └── ...
│   └── pokemon.module.ts
│
├── trainer/
│   ├── trainer-profile/
│   ├── trainer-team/
│   └── trainer.module.ts
│
└── battle/
    ├── battle-arena/
    ├── battle-log/
    └── battle.module.ts
```

#### Example Feature Component

```typescript
// features/pokemon/pokemon-card/pokemon-card.component.ts

@Component({
  selector: 'app-pokemon-card',
  template: `
    <div class="pokemon-card" (click)="onSelect()">
      <img [src]="pokemon.imageUrl" [alt]="pokemon.name" />
      <h3>#{{ pokemon.id }} {{ pokemon.name }}</h3>
      <div class="types">
        <span *ngFor="let type of pokemon.types" [class]="'type-' + type">
          {{ type }}
        </span>
      </div>
    </div>
  `,
})
export class PokemonCardComponent {
  @Input() pokemon!: PokemonDto;
  @Output() selected = new EventEmitter<number>();

  onSelect() {
    this.selected.emit(this.pokemon.id);
  }
}
```

---

### 3. Components (Shared App Components)

**Purpose:** Reusable components specific to the application

#### Characteristics

- **App-level** reusability
- Not generic enough for UI library
- Used across multiple pages/features

#### Example Structure

```
apps/pokedex-app/src/app/components/
├── header/
│   ├── header.component.ts
│   └── header.component.html
├── footer/
│   ├── footer.component.ts
│   └── footer.component.html
├── sidebar/
└── navigation/
```

#### Example

```typescript
// components/header/header.component.ts

@Component({
  selector: 'app-header',
  template: `
    <header>
      <div class="logo">
        <img src="/assets/logo.png" alt="Pokedex" />
        <h1>Pokedex</h1>
      </div>
      <nav>
        <a routerLink="/" routerLinkActive="active">Pokemon</a>
        <a routerLink="/trainer" routerLinkActive="active">Trainers</a>
        <a routerLink="/battle" routerLinkActive="active">Battle</a>
      </nav>
      <div class="user-menu">
        <span>{{ username }}</span>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Input() username = 'Guest';
}
```

---

### 4. UI Library (Design System)

**Purpose:** Generic, reusable UI components

#### Characteristics

- **Framework-level** reusability
- No business logic
- Pure presentation
- Shared across **multiple apps**
- Documented (Storybook)

#### Example Structure

```
libs/ui/
├── button/
│   ├── button.component.ts
│   ├── button.component.html
│   ├── button.component.scss
│   └── button.component.spec.ts
├── card/
├── input/
├── modal/
├── dropdown/
└── index.ts
```

#### Example

```typescript
// libs/ui/src/lib/button/button.component.ts

@Component({
  selector: 'ui-button',
  template: `
    <button [class]="'btn btn-' + variant + ' btn-' + size" [disabled]="disabled" (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() disabled = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
```

#### Usage

```typescript
// In any app component
<ui-button variant="primary" size="large" (onClick)="handleClick()">
  Catch Pokemon
</ui-button>
```

---

### 5. Facades

**Purpose:** Simplify complex state management and service orchestration

#### Characteristics

- **Abstraction layer** over services/state
- Hides complexity (RxJS, NgRx, etc.)
- Single entry point for components
- Manages local component state

#### When to Use

- ✅ Complex state management (NgRx, Akita)
- ✅ Multiple services coordination
- ✅ Complex RxJS streams
- ❌ Simple CRUD operations (use services directly)

#### Example Without Facade

```typescript
// Component dealing with multiple concerns - ❌ Complex
@Component({
  /* ... */
})
export class PokemonListComponent {
  pokemons$ = new BehaviorSubject<PokemonDto[]>([]);
  loading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  constructor(private pokemonService: PokemonService, private store: Store, private cache: CacheService) {}

  ngOnInit() {
    // Check cache
    const cached = this.cache.get('pokemons');
    if (cached) {
      this.pokemons$.next(cached);
      return;
    }

    // Load from API
    this.loading$.next(true);
    this.pokemonService
      .getAllPokemons()
      .pipe(
        tap((data) => this.cache.set('pokemons', data)),
        catchError((err) => {
          this.error$.next('Failed to load');
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((data) => {
        this.pokemons$.next(data);
        this.store.dispatch(setPokemon(data));
      });
  }
}
```

#### Example With Facade

```typescript
// Facade - ✅ Encapsulates complexity
@Injectable({ providedIn: 'root' })
export class PokemonFacade {
  // Observables
  pokemons$ = this.store.select(selectAllPokemons);
  loading$ = this.store.select(selectPokemonsLoading);
  error$ = this.store.select(selectPokemonsError);
  selectedPokemon$ = this.store.select(selectSelectedPokemon);

  constructor(private store: Store, private pokemonService: PokemonService, private cache: CacheService) {}

  // Actions
  loadPokemons() {
    // Check cache
    const cached = this.cache.get('pokemons');
    if (cached) {
      this.store.dispatch(setPokemon(cached));
      return;
    }

    // Load from API
    this.store.dispatch(loadPokemonsRequest());
    this.pokemonService
      .getAllPokemons()
      .pipe(tap((data) => this.cache.set('pokemons', data)))
      .subscribe({
        next: (data) => this.store.dispatch(loadPokemonsSuccess({ data })),
        error: (error) => this.store.dispatch(loadPokemonsFailure({ error })),
      });
  }

  selectPokemon(id: number) {
    this.store.dispatch(selectPokemon({ id }));
  }

  searchPokemons(query: string) {
    this.store.dispatch(searchPokemons({ query }));
  }

  clearSelection() {
    this.store.dispatch(clearSelection());
  }
}

// Component - ✅ Clean and simple
@Component({
  template: `
    <div *ngIf="facade.loading$ | async">Loading...</div>
    <div *ngIf="facade.error$ | async as error">{{ error }}</div>
    <div *ngFor="let pokemon of facade.pokemons$ | async">
      {{ pokemon.name }}
    </div>
  `,
})
export class PokemonListComponent implements OnInit {
  constructor(public facade: PokemonFacade) {}

  ngOnInit() {
    this.facade.loadPokemons();
  }
}
```

---

### Smart vs Dumb Components Pattern

#### Smart Components (Containers)

**Characteristics:**

- Know about **state management**
- Connect to **services/facades**
- Handle **business logic**
- Pass data down to dumb components

```typescript
// Smart Component
@Component({
  selector: 'app-pokemon-container',
  template: ` <app-pokemon-list [pokemons]="pokemons$ | async" (pokemonSelected)="onSelect($event)"> </app-pokemon-list> `,
})
export class PokemonContainerComponent {
  pokemons$ = this.facade.pokemons$;

  constructor(private facade: PokemonFacade) {}

  onSelect(id: number) {
    this.facade.selectPokemon(id);
  }
}
```

#### Dumb Components (Presentational)

**Characteristics:**

- Only @Input() and @Output()
- No services or state
- Pure presentation
- Highly reusable

```typescript
// Dumb Component
@Component({
  selector: 'app-pokemon-list',
  template: `
    <div *ngFor="let pokemon of pokemons" (click)="pokemonSelected.emit(pokemon.id)">
      {{ pokemon.name }}
    </div>
  `,
})
export class PokemonListComponent {
  @Input() pokemons: PokemonDto[] = [];
  @Output() pokemonSelected = new EventEmitter<number>();
}
```

---

## How DDD and Frontend Patterns Work Together

### Complete Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular)                    │
│  ┌────────────────────────────────────────────────┐    │
│  │  Pages (Smart Components)                      │    │
│  │  - Route-level containers                      │    │
│  │  - Orchestrate features                        │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────┐    │
│  │  Facades                                        │    │
│  │  - Simplify state management                   │    │
│  │  - Single entry point                          │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────┐    │
│  │  Features                                       │    │
│  │  - Domain-focused modules                      │    │
│  │  - Business components                         │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────┐    │
│  │  Components (Dumb)                              │    │
│  │  - Presentational only                         │    │
│  └─────────────────┬──────────────────────────────┘    │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────┐    │
│  │  UI Library                                     │    │
│  │  - Generic components                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼─────────────────────────────────┐
│                    BACKEND (NestJS)                      │
│  ┌────────────────────────────────────────────────┐     │
│  │  Controllers                                    │     │
│  │  - HTTP endpoints                              │     │
│  │  - Request/Response handling                   │     │
│  └─────────────────┬──────────────────────────────┘     │
│                    │ uses DTOs                           │
│  ┌─────────────────▼──────────────────────────────┐     │
│  │  Application Layer (DDD)                       │     │
│  │  - Use Cases                                   │     │
│  │  - Orchestrate domain logic                    │     │
│  └─────────────────┬──────────────────────────────┘     │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────┐     │
│  │  Domain Layer (DDD)                            │     │
│  │  - Entities, Value Objects                     │     │
│  │  - Business logic                              │     │
│  │  - Repository interfaces                       │     │
│  └─────────────────┬──────────────────────────────┘     │
│                    │                                     │
│  ┌─────────────────▼──────────────────────────────┐     │
│  │  Adapters Layer (DDD)                          │     │
│  │  - Repository implementations                  │     │
│  │  - Database access                             │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

### Request Flow Example

**User clicks "Load Pokemon" button:**

```
1. Page Component
   └─ Calls facade.loadPokemons()

2. Facade
   └─ Manages loading state
   └─ Calls pokemonService.getAllPokemons()

3. Service (Frontend)
   └─ HTTP GET /api/pokemon

4. Controller (Backend)
   └─ Receives request
   └─ Calls pokemonService.getAllPokemons()

5. Service (Backend)
   └─ Instantiates ListPokemonsUseCase
   └─ Calls useCase.execute()

6. Use Case
   └─ Calls pokemonRepository.findAll()

7. Repository
   └─ Queries database
   └─ Returns Pokemon entities

8. Use Case
   └─ Returns Pokemon entities

9. Service (Backend)
   └─ Maps entities to DTOs
   └─ Returns DTOs

10. Controller
    └─ Sends JSON response

11. Service (Frontend)
    └─ Receives DTOs
    └─ Returns Observable<PokemonDto[]>

12. Facade
    └─ Updates state
    └─ Emits to components

13. Page Component
    └─ Receives pokemons via facade.pokemons$
    └─ Passes to feature components

14. Feature Component
    └─ Renders Pokemon list
```

---

## Practical Examples

### Example 1: Adding a New Feature

**Requirement:** Add ability to favorite Pokemon

#### Step 1: Update Domain (Business Logic)

```typescript
// libs/domain/src/lib/entities/pokemon.entity.ts
export class Pokemon {
  constructor(
    public readonly id: number,
    public name: string,
    public readonly types: PokemonType[],
    public height: number,
    public weight: number,
    public readonly imageUrl: string,
    private _isFavorite: boolean = false // ← New property
  ) {}

  get isFavorite(): boolean {
    return this._isFavorite;
  }

  favorite(): void {
    if (this._isFavorite) {
      throw new Error('Pokemon is already favorited');
    }
    this._isFavorite = true;
  }

  unfavorite(): void {
    if (!this._isFavorite) {
      throw new Error('Pokemon is not favorited');
    }
    this._isFavorite = false;
  }

  toggleFavorite(): void {
    this._isFavorite = !this._isFavorite;
  }
}
```

#### Step 2: Update Repository Interface

```typescript
// libs/domain/src/lib/repositories/pokemon.repository.interface.ts
export interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findById(id: number): Promise<Pokemon | null>;
  findFavorites(): Promise<Pokemon[]>; // ← New method
  create(pokemon: Pokemon): Promise<Pokemon>;
  update(pokemon: Pokemon): Promise<Pokemon>;
  delete(id: number): Promise<void>;
}
```

#### Step 3: Create Use Case

```typescript
// libs/application/src/lib/use-cases/toggle-favorite-pokemon.use-case.ts
export class ToggleFavoritePokemonUseCase {
  constructor(private readonly pokemonRepository: IPokemonRepository) {}

  async execute(pokemonId: number): Promise<Pokemon> {
    const pokemon = await this.pokemonRepository.findById(pokemonId);
    if (!pokemon) {
      throw new Error('Pokemon not found');
    }

    pokemon.toggleFavorite();

    return await this.pokemonRepository.update(pokemon);
  }
}
```

#### Step 4: Update DTO

```typescript
// libs/contracts/src/lib/dtos/pokemon.dto.ts
export interface PokemonDto {
  id: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  imageUrl: string;
  isFavorite: boolean; // ← New field
}
```

#### Step 5: Update Backend Service/Controller

```typescript
// apps/pokedex-api/src/app/pokemon/pokemon.controller.ts
@Controller('pokemon')
export class PokemonController {
  // ... existing methods

  @Post(':id/favorite')
  async toggleFavorite(@Param('id') id: string) {
    return await this.pokemonService.toggleFavorite(+id);
  }

  @Get('favorites')
  async getFavorites() {
    return await this.pokemonService.getFavorites();
  }
}

// apps/pokedex-api/src/app/pokemon/pokemon.service.ts
@Injectable()
export class PokemonService {
  // ... existing methods

  async toggleFavorite(id: number): Promise<PokemonDto> {
    const useCase = new ToggleFavoritePokemonUseCase(this.pokemonRepository);
    const pokemon = await useCase.execute(id);
    return this.mapToDto(pokemon);
  }

  async getFavorites(): Promise<PokemonDto[]> {
    const pokemons = await this.pokemonRepository.findFavorites();
    return pokemons.map((p) => this.mapToDto(p));
  }
}
```

#### Step 6: Update Frontend Service

```typescript
// apps/pokedex-app/src/app/services/pokemon.service.ts
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly apiUrl = 'http://localhost:3000/api/pokemon';

  constructor(private http: HttpClient) {}

  // ... existing methods

  toggleFavorite(id: number): Observable<PokemonDto> {
    return this.http.post<PokemonDto>(`${this.apiUrl}/${id}/favorite`, {});
  }

  getFavorites(): Observable<PokemonDto[]> {
    return this.http.get<PokemonDto[]>(`${this.apiUrl}/favorites`);
  }
}
```

#### Step 7: Update Facade

```typescript
// apps/pokedex-app/src/app/facades/pokemon.facade.ts
@Injectable({ providedIn: 'root' })
export class PokemonFacade {
  private favoritesSubject = new BehaviorSubject<PokemonDto[]>([]);
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private pokemonService: PokemonService) {}

  // ... existing methods

  toggleFavorite(id: number) {
    this.pokemonService.toggleFavorite(id).subscribe({
      next: (pokemon) => {
        // Update local state
        const current = this.favoritesSubject.value;
        if (pokemon.isFavorite) {
          this.favoritesSubject.next([...current, pokemon]);
        } else {
          this.favoritesSubject.next(current.filter((p) => p.id !== id));
        }
      },
      error: (err) => console.error('Failed to toggle favorite', err),
    });
  }

  loadFavorites() {
    this.pokemonService.getFavorites().subscribe({
      next: (favorites) => this.favoritesSubject.next(favorites),
      error: (err) => console.error('Failed to load favorites', err),
    });
  }
}
```

#### Step 8: Update UI Component

```typescript
// apps/pokedex-app/src/app/features/pokemon/pokemon-card/pokemon-card.component.ts
@Component({
  selector: 'app-pokemon-card',
  template: `
    <div class="pokemon-card">
      <img [src]="pokemon.imageUrl" [alt]="pokemon.name" />
      <h3>#{{ pokemon.id }} {{ pokemon.name }}</h3>

      <!-- New favorite button -->
      <button class="favorite-btn" (click)="onToggleFavorite($event)" [class.active]="pokemon.isFavorite">
        <span *ngIf="pokemon.isFavorite">★</span>
        <span *ngIf="!pokemon.isFavorite">☆</span>
      </button>

      <div class="types">
        <span *ngFor="let type of pokemon.types">{{ type }}</span>
      </div>
    </div>
  `,
})
export class PokemonCardComponent {
  @Input() pokemon!: PokemonDto;
  @Output() favoriteToggled = new EventEmitter<number>();

  onToggleFavorite(event: Event) {
    event.stopPropagation(); // Don't trigger card click
    this.favoriteToggled.emit(this.pokemon.id);
  }
}
```

#### Step 9: Update Page Component

```typescript
// apps/pokedex-app/src/app/pages/pokemon-list-page/pokemon-list-page.component.ts
@Component({
  template: ` <app-pokemon-list [pokemons]="pokemons$ | async" (favoriteToggled)="onFavoriteToggled($event)"> </app-pokemon-list> `,
})
export class PokemonListPageComponent {
  pokemons$ = this.facade.pokemons$;

  constructor(private facade: PokemonFacade) {}

  onFavoriteToggled(id: number) {
    this.facade.toggleFavorite(id);
  }
}
```

---

### Example 2: Switching Repository Implementation

**Scenario:** Move from in-memory to PostgreSQL database

#### Current (In-Memory)

```typescript
// libs/adapters/src/lib/repositories/pokemon-inmemory.repository.ts
export class InMemoryPokemonRepository implements IPokemonRepository {
  private pokemons: Pokemon[] = [];
  // ... implementation
}
```

#### New (Database)

```typescript
// 1. Create ORM Entity
// libs/adapters/src/lib/entities/pokemon-orm.entity.ts
@Entity('pokemons')
export class PokemonOrmEntity {
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

  @Column({ default: false })
  isFavorite!: boolean;
}

// 2. Create Database Repository
// libs/adapters/src/lib/repositories/pokemon-database.repository.ts
@Injectable()
export class DatabasePokemonRepository implements IPokemonRepository {
  constructor(
    @InjectRepository(PokemonOrmEntity)
    private readonly repo: Repository<PokemonOrmEntity>
  ) {}

  async findAll(): Promise<Pokemon[]> {
    const entities = await this.repo.find();
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: number): Promise<Pokemon | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findFavorites(): Promise<Pokemon[]> {
    const entities = await this.repo.find({ where: { isFavorite: true } });
    return entities.map((e) => this.toDomain(e));
  }

  async create(pokemon: Pokemon): Promise<Pokemon> {
    const entity = this.repo.create(this.toOrm(pokemon));
    await this.repo.save(entity);
    return pokemon;
  }

  async update(pokemon: Pokemon): Promise<Pokemon> {
    await this.repo.update(pokemon.id, this.toOrm(pokemon));
    return pokemon;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: PokemonOrmEntity): Pokemon {
    return new Pokemon(
      entity.id,
      entity.name,
      entity.types.map((t) => PokemonType[t.toUpperCase() as keyof typeof PokemonType]),
      entity.height,
      entity.weight,
      entity.imageUrl,
      entity.isFavorite
    );
  }

  private toOrm(pokemon: Pokemon): Partial<PokemonOrmEntity> {
    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map((t) => t.toString()),
      height: pokemon.height,
      weight: pokemon.weight,
      imageUrl: pokemon.imageUrl,
      isFavorite: pokemon.isFavorite,
    };
  }
}

// 3. Update Module (ONLY CHANGE NEEDED!)
// apps/pokedex-api/src/app/pokemon/pokemon.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([PokemonOrmEntity])],
  controllers: [PokemonController],
  providers: [
    PokemonService,
    {
      provide: 'IPokemonRepository',
      useClass: DatabasePokemonRepository, // ← Changed from InMemoryPokemonRepository
    },
  ],
})
export class PokemonModule {}
```

**That's it!** No changes to:

- ✅ Domain entities
- ✅ Use cases
- ✅ Controllers
- ✅ Services
- ✅ Frontend
- ✅ DTOs

---

## Best Practices

### Domain Layer

✅ **DO:**

- Keep entities focused on business logic
- Make value objects immutable
- Use meaningful domain names (Ubiquitous Language)
- Put validation in entity constructors
- Keep dependencies minimal (no frameworks)

❌ **DON'T:**

- Add infrastructure code (database, HTTP)
- Depend on outer layers
- Use anemic domain models (getters/setters only)
- Mix presentation logic with business logic

### Application Layer

✅ **DO:**

- One use case per operation
- Keep use cases simple (orchestration only)
- Handle transactions at this layer
- Validate input from presentation layer

❌ **DON'T:**

- Put business logic in use cases (belongs in domain)
- Expose repositories directly to presentation
- Mix multiple responsibilities in one use case

### Adapters Layer

✅ **DO:**

- Implement repository interfaces from domain
- Map between domain and database models
- Handle framework-specific code here
- Create separate implementations for testing

❌ **DON'T:**

- Leak infrastructure details to domain
- Put business logic in repositories
- Access database directly from use cases

### Frontend

✅ **DO:**

- Use smart/dumb component pattern
- Keep components focused and small
- Use facades for complex state
- Organize by feature/domain
- Reuse UI components

❌ **DON'T:**

- Put business logic in components
- Access services directly from dumb components
- Create god components that do everything
- Mix presentation and business logic

---

## Common Pitfalls

### 1. Anemic Domain Model

❌ **Bad:**

```typescript
// Just data, no behavior
export class Pokemon {
  id: number;
  name: string;
  types: PokemonType[];

  // No methods!
}

// Logic scattered in services
export class PokemonService {
  isHeavy(pokemon: Pokemon): boolean {
    return pokemon.weight > 100;
  }

  canEvolve(pokemon: Pokemon): boolean {
    return pokemon.level >= 16;
  }
}
```

✅ **Good:**

```typescript
// Rich domain model
export class Pokemon {
  constructor(public readonly id: number, public name: string, public readonly types: PokemonType[], public weight: number, public level: number) {}

  // Business logic in entity
  isHeavy(): boolean {
    return this.weight > 100;
  }

  canEvolve(): boolean {
    return this.level >= 16;
  }

  evolve(newName: string): void {
    if (!this.canEvolve()) {
      throw new Error('Pokemon cannot evolve yet');
    }
    this.name = newName;
    this.level = 1;
  }
}
```

### 2. Breaking Layer Dependencies

❌ **Bad:**

```typescript
// Domain depending on infrastructure
import { Repository } from 'typeorm'; // ❌ Framework dependency

export class Pokemon {
  constructor(private repo: Repository<Pokemon>) {} // ❌ Infrastructure in domain
}
```

✅ **Good:**

```typescript
// Domain has no dependencies
export class Pokemon {
  constructor(public readonly id: number, public name: string) {}
}

// Infrastructure depends on domain
export class DatabasePokemonRepository implements IPokemonRepository {
  constructor(@InjectRepository(PokemonOrmEntity) private repo: Repository<PokemonOrmEntity>) {}
}
```

### 3. Over-Engineering

❌ **Bad:**

```typescript
// Too many layers for simple CRUD
export class GetPokemonByIdUseCase {
  execute(id: number) {
    return this.repo.findById(id); // Just passthrough
  }
}
```

✅ **Good:**

```typescript
// Use cases for complex operations
export class EvolvePokemonUseCase {
  async execute(id: number): Promise<Pokemon> {
    const pokemon = await this.repo.findById(id);
    const trainer = await this.trainerRepo.findByPokemonId(id);

    if (!pokemon.canEvolve()) {
      throw new Error('Cannot evolve');
    }

    if (!trainer.hasEvolutionStone()) {
      throw new Error('Needs evolution stone');
    }

    pokemon.evolve(this.evolutionService.getEvolvedForm(pokemon));
    trainer.useEvolutionStone();

    await this.repo.update(pokemon);
    await this.trainerRepo.update(trainer);

    return pokemon;
  }
}
```

### 4. DTOs Everywhere

❌ **Bad:**

```typescript
// Using DTOs internally
export class PokemonService {
  async getPokemon(id: number): Promise<PokemonDto> {
    const dto = await this.repo.findById(id); // ❌ Repo returns DTO
    return dto;
  }
}
```

✅ **Good:**

```typescript
// DTOs only at boundaries
export class PokemonService {
  async getPokemon(id: number): Promise<PokemonDto> {
    const pokemon = await this.repo.findById(id); // ✅ Repo returns Entity
    return this.mapToDto(pokemon); // ✅ Map at boundary
  }
}
```

### 5. God Classes

❌ **Bad:**

```typescript
// One facade that does everything
export class PokemonFacade {
  loadPokemons() {}
  loadTrainers() {}
  startBattle() {}
  evolve() {}
  trade() {}
  heal() {}
  // ... 50 more methods
}
```

✅ **Good:**

```typescript
// Focused facades
export class PokemonFacade {
  loadPokemons() {}
  selectPokemon() {}
  searchPokemons() {}
}

export class BattleFacade {
  startBattle() {}
  attack() {}
  defend() {}
}

export class TrainerFacade {
  loadTrainer() {}
  heal() {}
  trade() {}
}
```

---

## Frequently Asked Questions (FAQ)

### General DDD Questions

#### Q: What's the difference between an Entity and a Value Object?

**A:** The key difference is **identity vs. value**.

**Entity:**

- Has a unique identifier (ID)
- Identity persists even if attributes change
- Mutable - can change over time
- Example: A Pokemon with ID #25 is always that Pikachu, even if its weight changes

**Value Object:**

- No identity - defined entirely by its values
- Immutable - create new ones instead of modifying
- All instances with same values are identical
- Example: The type "FIRE" - all FIRE types are the same, no individual identity

**Real-world analogy:**

- Entity = You (you have an ID, you change but you're still you)
- Value Object = Money ($100 is just $100, no identity)

---

#### Q: What's the difference between a DTO and an Entity?

**A:** They serve different purposes in different layers.

**Entity (Domain Layer):**

- Contains **business logic** and behavior
- Rich model with methods
- May have complex types (enums, value objects)
- Internal to your application
- Example: `pokemon.evolve()` - has behavior

**DTO (Contracts Layer):**

- **Just data**, no logic
- For transferring data across boundaries (API, network)
- Uses primitive types (serializable to JSON)
- External communication
- Example: `{ id: 1, name: "Pikachu", types: ["electric"] }` - just data

**Why separate?**

- Entities can have methods (not serializable)
- Entities may have sensitive data you don't want to expose
- DTOs provide API stability (entity can change without breaking API)
- Different representations: one entity can have multiple DTOs

---

#### Q: Do both Entities and Value Objects go in the Domain layer?

**A:** Yes! Both are core domain concepts.

**Domain Layer contains:**

- ✅ Entities (Pokemon, Trainer)
- ✅ Value Objects (PokemonType, Stats)
- ✅ Repository Interfaces (IPokemonRepository)
- ✅ Domain Services (BattleService)

**Key rule:** The Domain layer has NO dependencies on other layers. It's pure business logic.

---

#### Q: Why use Repository interfaces instead of concrete implementations?

**A:** For **flexibility and testability** through Dependency Inversion.

**Benefits:**

1. **Swap implementations easily:** In-memory → Database → API, no business logic changes
2. **Easy testing:** Use mock repositories for unit tests
3. **Multiple implementations:** Different databases, caching, etc.
4. **Database agnostic:** Domain doesn't know about SQL, MongoDB, etc.

**Example:**

```typescript
// Domain defines contract (what you need)
interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
}

// Adapters provide implementations (how it's done)
class InMemoryPokemonRepository implements IPokemonRepository {}
class DatabasePokemonRepository implements IPokemonRepository {}
class ApiPokemonRepository implements IPokemonRepository {}

// Switch with ONE line in your module!
```

---

#### Q: If I need to use a database, do I create a new repository implementation without touching the interface?

**A:** Exactly! That's the power of DDD.

**Steps:**

1. ✅ Keep interface unchanged (in `domain` layer)
2. ✅ Create new implementation (in `adapters` layer)
3. ✅ Update dependency injection (one line in module)
4. ❌ No changes to: domain, application, controllers, services, frontend

**Example:**

```typescript
// 1. Interface stays the same
interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
}

// 2. New implementation
class PostgreSQLPokemonRepository implements IPokemonRepository {
  async findAll() {
    // PostgreSQL specific code
  }
}

// 3. Change DI (only place you modify)
@Module({
  providers: [{
    provide: 'IPokemonRepository',
    useClass: PostgreSQLPokemonRepository  // ← Changed
  }]
})
```

---

### Repository Questions

#### Q: Should repository interfaces have attributes/properties?

**A:** No, only methods (behavior).

**Why?**

- Interfaces define **contracts** (what operations are available)
- State/attributes are **implementation details**
- Different implementations might store data differently

**Correct approach:**

```typescript
// Interface - only methods ✅
interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
  findById(id: number): Promise<Pokemon | null>;
}

// Implementation - has attributes ✅
class InMemoryPokemonRepository implements IPokemonRepository {
  private pokemons: Pokemon[] = []; // ← Implementation detail

  async findAll() {
    return this.pokemons;
  }
}
```

---

#### Q: Do I need to use `abstract` keyword in repository interfaces?

**A:** No, interfaces are already abstract by definition.

**Interface (Recommended for DDD):**

```typescript
// No 'abstract' needed - interfaces are contracts
interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>; // Already abstract
}
```

**Abstract Class (Alternative):**

```typescript
// Need 'abstract' keyword for methods without implementation
abstract class PokemonRepositoryBase {
  abstract findAll(): Promise<Pokemon[]>; // ← Need 'abstract'

  // Can also have implemented methods
  async exists(id: number): Promise<boolean> {
    const pokemon = await this.findById(id);
    return pokemon !== null;
  }
}
```

**Use interfaces** for DDD - they're simpler and more flexible.

---

#### Q: Why does the repository use a database Entity instead of DTO?

**A:** There are actually **three different "entities"** - don't confuse them!

1. **Domain Entity** (`Pokemon` class) - Business logic, in domain layer
2. **ORM Entity** (`PokemonEntity` with TypeORM decorators) - Database mapping, in adapters layer
3. **DTO** (`PokemonDto` interface) - API communication, in contracts layer

**Why repository uses ORM Entity:**

- TypeORM/other ORMs need their own decorated entities for database mapping
- Repository's job is to **translate** between ORM entities and Domain entities

**Flow:**

```
Database → ORM Entity → Domain Entity → DTO → Frontend
```

**Example:**

```typescript
// ORM Entity (database structure)
@Entity('pokemons')
class PokemonOrmEntity {
  @Column() name: string;
}

// Repository translates
class DatabaseRepository {
  async findAll(): Promise<Pokemon[]> {
    // ← Returns Domain Entity
    const ormEntities = await this.db.find(); // ← Gets ORM Entities
    return ormEntities.map((e) => this.toDomain(e)); // ← Converts
  }
}
```

**Note:** With in-memory repository, you can use Domain Entity directly (no database, no ORM).

---

### Frontend Pattern Questions

#### Q: What about UI folder, facades, pages, features, components? Are those part of DDD?

**A:** No, those are **Frontend Architecture Patterns** that **complement DDD**.

**DDD (Backend/Domain focus):**

- Entities, Value Objects, Repositories
- Use Cases, Domain Services
- Focus: Business logic and domain modeling

**Frontend Patterns (UI focus):**

- Pages, Features, Components, Facades
- Smart/Dumb components
- Focus: UI organization and presentation

**They work together:**

```
Frontend Patterns (Angular)
    ↓
    Services/Facades
    ↓
    HTTP/API
    ↓
DDD Layers (NestJS)
    ↓
    Domain/Application/Adapters
```

**Key difference:**

- DDD = How to model and organize business logic
- Frontend Patterns = How to organize UI components

See the [Frontend Architecture Patterns](#frontend-architecture-patterns) section for details.

---

### Architecture Questions

#### Q: Which layers can depend on which?

**A:** Dependencies always point inward toward the domain.

```
Presentation → Application → Domain
     ↓              ↓          ↑
Infrastructure ─────┘          │
(implements interfaces from Domain)
```

**Rules:**

- ✅ Application can depend on Domain
- ✅ Infrastructure can depend on Domain (implements interfaces)
- ✅ Presentation can depend on Application and Contracts
- ❌ Domain NEVER depends on outer layers
- ❌ Domain has zero dependencies (pure business logic)

---

#### Q: Where do I put X?

Quick reference for common items:

| Item                       | Layer        | Example                       |
| -------------------------- | ------------ | ----------------------------- |
| Business logic             | Domain       | `pokemon.evolve()`            |
| Validation rules           | Domain       | `if (level < 16) throw Error` |
| Entities                   | Domain       | `Pokemon`, `Trainer`          |
| Value Objects              | Domain       | `PokemonType`, `Stats`        |
| Repository interfaces      | Domain       | `IPokemonRepository`          |
| Use cases                  | Application  | `CatchPokemonUseCase`         |
| Repository implementations | Adapters     | `DatabasePokemonRepository`   |
| Database entities          | Adapters     | `PokemonOrmEntity`            |
| API controllers            | Presentation | `PokemonController`           |
| DTOs                       | Contracts    | `PokemonDto`                  |
| Frontend services          | Presentation | `PokemonService`              |
| UI components              | Presentation | `PokemonListComponent`        |

---

#### Q: When should I use a Facade?

**A:** Use facades for **complex state management**, not simple operations.

**Use Facade when:**

- ✅ Using NgRx, Akita, or complex state management
- ✅ Coordinating multiple services
- ✅ Complex RxJS stream orchestration
- ✅ Want to hide complexity from components

**Don't use Facade when:**

- ❌ Simple CRUD operations
- ❌ Single service call
- ❌ Over-engineering simple features

**Example - When to use:**

```typescript
// Complex - use Facade ✅
facade.loadPokemons(); // Checks cache, loads from API, updates store
facade.searchPokemons(query); // Filters, debounces, searches
facade.favorites$; // Combines multiple streams

// Simple - use Service directly ✅
service.getPokemon(id).subscribe(); // Just one HTTP call
```

---

### Common Confusion

#### Q: What's the difference between Service and Use Case?

**Backend Services** (NestJS):

- Coordinate use cases
- Map between DTOs and Domain Entities
- Handle framework-specific concerns (dependency injection)

**Use Cases** (Application Layer):

- Pure business operations
- Framework agnostic
- Single responsibility

**Example:**

```typescript
// Service (NestJS specific)
@Injectable()
class PokemonService {
  async getPokemon(id: number): Promise<PokemonDto> {
    const useCase = new GetPokemonUseCase(this.repo);
    const pokemon = await useCase.execute(id);
    return this.mapToDto(pokemon); // Maps to DTO
  }
}

// Use Case (Pure business logic)
class GetPokemonUseCase {
  execute(id: number): Promise<Pokemon> {
    return this.repo.findById(id);
  }
}
```

---

#### Q: Can I skip Use Cases for simple CRUD operations?

**A:** Yes! Don't over-engineer.

**Skip Use Cases when:**

- Simple read operation (just return data)
- Direct repository call with no logic

**Use Use Cases when:**

- Multiple repository calls
- Business logic involved
- Transaction boundaries
- Complex orchestration

**Example:**

```typescript
// Simple - skip use case ✅
async getPokemon(id: number) {
  return this.repo.findById(id);
}

// Complex - use case needed ✅
class EvolvePokemonUseCase {
  async execute(id: number) {
    const pokemon = await this.pokemonRepo.findById(id);
    const trainer = await this.trainerRepo.findByPokemonId(id);

    // Business logic
    if (!pokemon.canEvolve()) throw Error();
    if (!trainer.hasStone()) throw Error();

    pokemon.evolve();
    trainer.useStone();

    await this.pokemonRepo.update(pokemon);
    await this.trainerRepo.update(trainer);
  }
}
```

---

## Resources

### Books

- **Domain-Driven Design** by Eric Evans (The "Blue Book")
- **Implementing Domain-Driven Design** by Vaughn Vernon (The "Red Book")
- **Clean Architecture** by Robert C. Martin
- **Patterns of Enterprise Application Architecture** by Martin Fowler

### Articles & Blogs

- [Martin Fowler - Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [DDD Community](https://dddcommunity.org/)
- [Microsoft - Domain-Driven Design](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/)

### Videos

- [Domain-Driven Design Quickly](https://www.infoq.com/minibooks/domain-driven-design-quickly/)
- [GOTO Conferences - DDD talks](https://www.youtube.com/c/GotoConferences)

### Tools & Libraries

- **NestJS** - Framework with built-in DDD support
- **TypeORM** - ORM for database access
- **NgRx** - State management for Angular
- **NX** - Monorepo tools

---

## Glossary

| Term                    | Definition                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| **Aggregate**           | Cluster of objects treated as a unit                                  |
| **Aggregate Root**      | Entry point to an aggregate                                           |
| **Bounded Context**     | Explicit boundary where a domain model applies                        |
| **Domain**              | Sphere of knowledge and activity around which business logic revolves |
| **Domain Event**        | Something that happened in the domain                                 |
| **Domain Service**      | Operation that doesn't naturally fit in an entity                     |
| **DTO**                 | Data Transfer Object - simple object for transferring data            |
| **Entity**              | Object with unique identity                                           |
| **Facade**              | Simplified interface to complex subsystem                             |
| **Repository**          | Abstraction for accessing domain objects                              |
| **Ubiquitous Language** | Common language shared by developers and domain experts               |
| **Use Case**            | Specific business operation                                           |
| **Value Object**        | Object defined by its attributes, with no identity                    |

---

**Happy coding with DDD! 🚀**

_This guide is a living document. Update it as you learn and discover new patterns._
