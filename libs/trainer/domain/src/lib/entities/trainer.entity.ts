import { TrainerBadge } from '../value-objects/trainer-badge.enum';

export class Trainer {
  constructor(
    public readonly id: number,
    public name: string,
    public age: number,
    public hometown: string,
    private badges: TrainerBadge[] = [],
    private favoritePokemonIds: number[] = []
  ) {}

  // Domain logic methods
  addBadge(badge: TrainerBadge): void {
    if (this.hasBadge(badge)) {
      throw new Error(`Trainer already has ${badge} badge`);
    }
    this.badges.push(badge);
  }

  hasBadge(badge: TrainerBadge): boolean {
    return this.badges.includes(badge);
  }

  getBadges(): readonly TrainerBadge[] {
    return this.badges;
  }

  getBadgeCount(): number {
    return this.badges.length;
  }

  isChampion(): boolean {
    return this.badges.length >= 8;
  }

  addFavoritePokemon(pokemonId: number): void {
    if (this.favoritePokemonIds.length >= 6) {
      throw new Error('Cannot have more than 6 favorite Pokemon');
    }
    if (this.isFavoritePokemon(pokemonId)) {
      throw new Error('Pokemon is already in favorites');
    }
    this.favoritePokemonIds.push(pokemonId);
  }

  removeFavoritePokemon(pokemonId: number): void {
    this.favoritePokemonIds = this.favoritePokemonIds.filter(
      (id) => id !== pokemonId
    );
  }

  isFavoritePokemon(pokemonId: number): boolean {
    return this.favoritePokemonIds.includes(pokemonId);
  }

  getFavoritePokemonIds(): readonly number[] {
    return this.favoritePokemonIds;
  }

  canAddMoreFavorites(): boolean {
    return this.favoritePokemonIds.length < 6;
  }
}
