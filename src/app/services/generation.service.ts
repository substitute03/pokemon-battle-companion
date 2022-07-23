import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NamedAPIResourceList, GameClient } from "pokenode-ts";
import { DamageMultipliers } from "../domain/damageMultipliers"
import { interval, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GenerationService {
    constructor(private http: HttpClient) { }

    public getAllGenerations(): Observable<NamedAPIResourceList> {
        return this.http.get<NamedAPIResourceList>('https://pokeapi.co/api/v2/generation');
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