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
export class GenerationService {
    constructor(private http: HttpClient) { }

    public getAllGenerations(): Observable<NamedApiResourceList> {
        return this.http.get<NamedApiResourceList>('https://pokeapi.co/api/v2/generation');
    }

    public async getAllGenerationNamesAsync(): Promise<string[]> {
        let allGenerations = await firstValueFrom(this.getAllGenerations());

        let allNames: string[] = [];
        allGenerations.results.forEach(result => {
            allNames.push(result.name);
        });

        return allNames;
    }
}