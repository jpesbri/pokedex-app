# Pokedex App - Domain-Driven Design Example

A full-stack application built with **Angular**, **NestJS**, and **NX Monorepo** to demonstrate **Domain-Driven Design (DDD)** principles and architecture.

## 🎯 Purpose

This project serves as a learning example and reference implementation of DDD concepts in a real-world application. It showcases:

- **Clean Architecture** with clear separation of concerns
- **Domain-Driven Design** patterns and best practices
- **SOLID principles** implementation
- **Dependency Inversion** for flexible and testable code
- **NX Monorepo** for scalable project structure

## 🏗️ Architecture

The project follows a **layered DDD architecture**:

```
├── apps/
│   ├── pokedex-app/          # Angular Frontend
│   ├── pokedex-api/          # NestJS Backend API
│   └── *-e2e/                # E2E tests
│
└── libs/
    ├── domain/               # 🔵 Domain Layer
    │   ├── entities/         #    - Pokemon entity (business logic)
    │   ├── value-objects/    #    - PokemonType enum
    │   └── repositories/     #    - Repository interfaces
    │
    ├── application/          # 🟢 Application Layer
    │   └── use-cases/        #    - ListPokemonsUseCase
    │                         #    - GetPokemonByIdUseCase
    │
    ├── adapters/             # 🟡 Adapters Layer
    │   └── repositories/     #    - InMemoryPokemonRepository
    │                         #    - (Future: DatabaseRepository)
    │
    ├── contracts/            # 🟣 Contracts Layer
    │   └── dtos/             #    - PokemonDto
    │                         #    - API interfaces
    │
    └── ui/                   # 🎨 Shared UI Components
```

### Layer Responsibilities

| Layer           | Purpose                                      | Dependencies        |
| --------------- | -------------------------------------------- | ------------------- |
| **Domain**      | Core business logic, entities, value objects | None (pure domain)  |
| **Application** | Use cases, orchestration                     | Domain              |
| **Adapters**    | Infrastructure, repositories, external APIs  | Domain, Application |
| **Contracts**   | DTOs, shared interfaces                      | None                |

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

**Start Backend (NestJS):**

```bash
nx serve pokedex-api
```

API will be available at `http://localhost:3000/api`

**Start Frontend (Angular):**

```bash
nx serve pokedex-app
```

App will be available at `http://localhost:4200`

**Run Both Simultaneously:**

```bash
# Terminal 1
nx serve pokedex-api

# Terminal 2
nx serve pokedex-app
```

## 📚 Key DDD Concepts Demonstrated

### 1. **Entities**

Domain objects with unique identity and business logic.

```typescript
// libs/domain/src/lib/entities/pokemon.entity.ts
class Pokemon {
  hasType(type: PokemonType): boolean { ... }
  isHeavy(): boolean { ... }
}
```

### 2. **Value Objects**

Immutable objects defined by their values.

```typescript
// libs/domain/src/lib/value-objects/pokemon-type.enum.ts
enum PokemonType { FIRE, WATER, GRASS, ... }
```

### 3. **Repository Pattern**

Interface in domain, implementation in adapters.

```typescript
// Domain defines the contract
interface IPokemonRepository {
  findAll(): Promise<Pokemon[]>;
}

// Adapters provide implementation
class InMemoryPokemonRepository implements IPokemonRepository { ... }
```

### 4. **Use Cases**

Single-purpose application logic.

```typescript
// libs/application/src/lib/use-cases/list-pokemons.use-case.ts
class ListPokemonsUseCase {
  execute(): Promise<Pokemon[]> { ... }
}
```

### 5. **DTOs (Data Transfer Objects)**

Simple objects for transferring data between layers.

```typescript
// libs/contracts/src/lib/dtos/pokemon.dto.ts
interface PokemonDto {
  id: number;
  name: string;
  types: string[];
}
```

## 🔄 Data Flow

```
Frontend (Angular)
    ↓ HTTP Request
Controller (NestJS)
    ↓ calls
Service
    ↓ instantiates
Use Case (Application Layer)
    ↓ uses
Repository Interface (Domain Layer)
    ↓ implemented by
Repository Implementation (Adapters Layer)
    ↓ returns
Domain Entity
    ↓ mapped to
DTO
    ↓ HTTP Response
Frontend (Angular)
```

## 🎨 API Endpoints

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| GET    | `/api/pokemon`     | Get all Pokemon   |
| GET    | `/api/pokemon/:id` | Get Pokemon by ID |

## 🧪 Testing

```bash
# Run unit tests
nx test domain
nx test application

# Run E2E tests
nx e2e pokedex-app-e2e
nx e2e pokedex-api-e2e
```

## 🔧 Tech Stack

- **Frontend:** Angular 20, RxJS, TypeScript
- **Backend:** NestJS, TypeScript
- **Monorepo:** NX
- **Architecture:** Domain-Driven Design (DDD)
- **Testing:** Jest, Playwright

## 📖 Learning Resources

### DDD Concepts Explained

- **Entity vs Value Object:** Entities have identity, value objects don't
- **Repository Pattern:** Abstracts data access, implementations can be swapped
- **Use Cases:** Represent specific business operations
- **Dependency Inversion:** Depend on abstractions (interfaces), not concrete implementations

### Benefits of This Architecture

✅ **Testability:** Easy to unit test with mock repositories  
✅ **Maintainability:** Clear separation of concerns  
✅ **Flexibility:** Swap implementations without changing business logic  
✅ **Scalability:** Add new features without touching existing code  
✅ **Team Collaboration:** Multiple developers can work on different layers

## 🔮 Future Enhancements

- [ ] Add database repository (PostgreSQL/MongoDB)
- [ ] Implement authentication and authorization
- [ ] Add more entities (Trainer, Battle)
- [ ] Create Pokemon (POST endpoint)
- [ ] Search and filter functionality
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 📝 Project Commands

```bash
# Generate new library
nx generate @nx/js:library <name> --directory=libs/<name>

# Generate new component
nx generate @nx/angular:component <name> --project=pokedex-app

# Build for production
nx build pokedex-api
nx build pokedex-app

# Visualize project graph
nx graph

# Run linting
nx lint pokedex-api
nx lint pokedex-app
```

## 🤝 Contributing

This is a learning project. Feel free to:

- Experiment with different implementations
- Add new features following DDD principles
- Refactor and improve the architecture
- Add tests and documentation

## 📄 License

MIT

---

**Built with ❤️ to learn and demonstrate Domain-Driven Design principles.**
