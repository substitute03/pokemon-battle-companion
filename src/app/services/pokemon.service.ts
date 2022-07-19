import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Pokemon } from "../domain/pokemon";
import { NamedApiResourceList } from "../domain/namedApiResourceList";
import { DamageMultipliers } from "../domain/damageMultipliers"
import { interval, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PokemonService {
    constructor(private http: HttpClient) { }

    public getPokemonById(id: number): Observable<Pokemon> {
        return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`);
    }

    public getPokemonByName(name: string): Observable<Pokemon> {
        return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${name}`);
    }

    public getAllPokemon(): Observable<NamedApiResourceList> {
        return this.http.get<NamedApiResourceList>('https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000');
    }

    public async getAllPokemonNamesAsync(): Promise<string[]> {
        let allPokemon = await firstValueFrom(this.getAllPokemon());

        let allNames: string[] = [];
        allPokemon.results.forEach(result => {
            allNames.push(result.name);
        });

        return allNames;
    }
}
