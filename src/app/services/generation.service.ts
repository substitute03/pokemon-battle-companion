import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NamedAPIResourceList, GameClient } from "pokenode-ts";
import { DamageMultipliers } from "../domain/damageMultipliers"
import { interval, firstValueFrom } from 'rxjs';
import { GenerationDomain } from "../domain/generationDomain";

@Injectable({
    providedIn: 'root'
})
export class GenerationService {
    constructor(private http: HttpClient) { }

    public async getAllGenerationsDomain() {
        return this.mapToGenerationDomain(await firstValueFrom(this.getAllGenerations()));
    }

    private getAllGenerations(): Observable<NamedAPIResourceList> {
        return this.http.get<NamedAPIResourceList>('https://pokeapi.co/api/v2/generation');
    }

    private mapToGenerationDomain(generations: NamedAPIResourceList): GenerationDomain[] {
        let generationsDomain: GenerationDomain[] = [];

        generations.results.forEach(g => {
            // Extract the generation numberal from the generation name.
            const generaionNumeral = g.name.slice(g.name.indexOf("-") + 1);

            // Extract the generation number from the url.
            const reversedUrl = g.url.split("").reverse().join("");
            const firstSlashIndex = reversedUrl.indexOf("/");
            const secondSlashIndex = reversedUrl.indexOf("/", firstSlashIndex + 1);
            const generationNumber = Number(reversedUrl.slice(firstSlashIndex + 1, secondSlashIndex));

            generationsDomain.push({
                numeral: generaionNumeral,
                number: generationNumber,
            } as GenerationDomain);
        });

        return generationsDomain;
    }
}