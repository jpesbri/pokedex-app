import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../services/pokemon.service';
import { PokemonDto } from '@pokedex-app/pokemon-contracts';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pokemon-list">
      <h1>Pokedex</h1>

      <div *ngIf="loading" class="loading">Loading Pokemon...</div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="pokemon-grid" *ngIf="!loading && !error">
        <div *ngFor="let pokemon of pokemons" class="pokemon-card">
          <img [src]="pokemon.imageUrl" [alt]="pokemon.name" />
          <h3>#{{ pokemon.id }} {{ pokemon.name }}</h3>
          <div class="types">
            <span *ngFor="let type of pokemon.types" class="type-badge">
              {{ type }}
            </span>
          </div>
          <p class="stats">
            Height: {{ pokemon.height }} | Weight: {{ pokemon.weight }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .pokemon-list {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        text-align: center;
        color: #333;
        font-size: 2.5rem;
        margin-bottom: 30px;
      }

      .loading,
      .error {
        text-align: center;
        padding: 20px;
        font-size: 1.2rem;
      }

      .error {
        color: #d32f2f;
      }

      .pokemon-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }

      .pokemon-card {
        border: 2px solid #ddd;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .pokemon-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      }

      .pokemon-card img {
        width: 120px;
        height: 120px;
        margin-bottom: 10px;
      }

      .pokemon-card h3 {
        margin: 10px 0;
        color: #333;
        text-transform: capitalize;
      }

      .types {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin: 10px 0;
      }

      .type-badge {
        background: #4caf50;
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85rem;
        text-transform: capitalize;
      }

      .stats {
        color: #666;
        font-size: 0.9rem;
        margin-top: 10px;
      }
    `,
  ],
})
export class PokemonListComponent implements OnInit {
  pokemons: PokemonDto[] = [];
  loading = false;
  error: string | null = null;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private pokemonService: PokemonService) {}

  ngOnInit() {
    this.loadPokemons();
  }

  loadPokemons() {
    this.loading = true;
    this.error = null;

    this.pokemonService.getAllPokemons().subscribe({
      next: (data) => {
        this.pokemons = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading pokemons:', err);
        this.error = 'Failed to load Pokemon. Please try again later.';
        this.loading = false;
      },
    });
  }
}
