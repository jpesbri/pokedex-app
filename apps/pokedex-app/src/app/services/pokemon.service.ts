import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PokemonDto } from '@pokedex-app/contracts';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private readonly apiUrl = 'http://localhost:3000/api/pokemon';

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private http: HttpClient) {}

  getAllPokemons(): Observable<PokemonDto[]> {
    return this.http.get<PokemonDto[]>(this.apiUrl);
  }

  getPokemonById(id: number): Observable<PokemonDto> {
    return this.http.get<PokemonDto>(`${this.apiUrl}/${id}`);
  }
}
