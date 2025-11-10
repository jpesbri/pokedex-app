import { Route } from '@angular/router';
import { PokemonListComponent } from './pokemin-list/pokemon-list.component';

export const appRoutes: Route[] = [
  { path: '', component: PokemonListComponent },
];
