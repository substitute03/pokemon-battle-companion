import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, interval, firstValueFrom } from 'rxjs';
import { Pokemon, PokemonClient, NamedAPIResourceList, MainClient, Type, Generation, PokemonPastType, PokemonType } from "pokenode-ts";
import { PokemonDomain } from "../domain/pokemonDomain";
import { TypeName } from "../domain/typeDomain";
import { DamageMultipliers } from "../domain/damageMultipliers";
import { TypeService } from "./type.service";

@Injectable({
    providedIn: 'root'
})
export class PokemonService {
    // private readonly pokeApi: MainClient;
    private readonly pokemonClient: PokemonClient;
    private readonly mainClient: MainClient;

    constructor(private http: HttpClient, private _typeService: TypeService) {
        this.pokemonClient = new PokemonClient;
        this.mainClient = new MainClient;
    }

    public getPokemonById(id: number): Observable<Pokemon> {
        return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`);
    }

    public getPokemonByName(name: string): Observable<Pokemon> {
        return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${name}`);
    }

    public getAllPokemon(): Observable<NamedAPIResourceList> {
        return this.http.get<NamedAPIResourceList>('https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000');
    }

    public async getAllPokemonNamesAsync(): Promise<string[]> {
        let allPokemon = await firstValueFrom(this.getAllPokemon());

        let allNames: string[] = [];
        allPokemon.results.forEach(result => {
            allNames.push(result.name);
        });

        return allNames;
    }

    public async getPokemonByGeneration(pokemonName: string, selectedGenerationId: number): Promise<PokemonDomain | null> {
        const pokemonApi: Pokemon =
            await this.pokemonClient.getPokemonByName(pokemonName);

        // TODO: add something to handle pokmon not found and return null?

        const introductedInVersionName: string =
            (await this.mainClient.pokemon.getPokemonFormByName(pokemonName)).version_group.name;

        const introducedInGenerationName: string =
            (await this.mainClient.game.getVersionGroupByName(introductedInVersionName)).generation.name;

        const introducedInGenerationId: number =
            (await this.mainClient.game.getGenerationByName(introducedInGenerationName)).id;

        // If the user has selected a generation earlier than when the Pokemon was introduced.
        if (selectedGenerationId < introducedInGenerationId) {
            return null;
        }

        const types: Type[] =
            await this.getPokemonTypesByGeneration(pokemonApi, selectedGenerationId);

        const defensiveDamageMultipliers: DamageMultipliers = await this._typeService
            .getDefensiveDamageMultipliersByGeneration(types, selectedGenerationId);

        const sprite: string | null = pokemonApi.sprites.other['official-artwork'].front_default;

        // map pokemon to api
        const pokemonDomain = this.mapToPokemonDomain(
            pokemonApi.id,
            pokemonApi.name,
            selectedGenerationId,
            types.map(t => t.name as TypeName),
            defensiveDamageMultipliers,
            sprite);

        return pokemonDomain;
    }

    private async getPokemonTypesByGeneration(
        pokemonApi: Pokemon,
        selectedGenerationId: number,
    ): Promise<Type[]> {
        const pastTypes: PokemonPastType[] = pokemonApi.past_types;
        const currentTypes: PokemonType[] = pokemonApi.types;

        // The selected generation will always be higher than the introduced in generation at this point.
        // Note that a pokemon's past types work in "reverse order". E.g. Wigglytuff was changed to normal/fairy
        // in gen 6 so its past types array would contain "gen 5 - normal"

        // If the pokemon has past types, get the generation ids of when their typing was different to their current type names.
        let typesDifferentInGenIds: number[] = [];
        let typesDifferentInGens: Generation[] = [];
        let typeNames: TypeName[] = [];

        for (const pastType of pastTypes) {
            const generation: Generation =
                await this.mainClient.game.getGenerationByName(pastType.generation.name);

            typesDifferentInGens.push(generation);
            typesDifferentInGenIds.push(generation.id);
        }

        // Sort by descending so most recent gen id is on top.
        typesDifferentInGenIds.sort((n1, n2) => n1 - n2);

        // If the pokemon has no past types, or if the selected generation is
        // greater than the most recent type change, get the mon's current type names.
        if ((pastTypes.length === 0) ||
            (selectedGenerationId > Math.max(...typesDifferentInGens.map(x => x.id)))) {
            for (let typeName of currentTypes.map(ct => ct.type.name as TypeName)) {
                typeNames.push(typeName);
            };
        }

        // If the types have only changed once and selected generation is less than or equal to the most recent type change,
        // get the type names from the earlier generation.
        // TODO: This scenario may be covered by the i
        if (pastTypes.length === 1 &&
            selectedGenerationId <= Math.max(...typesDifferentInGens.map(x => x.id))) {
            for (let typeName of pastTypes[0].types.map(t => t.type.name as TypeName)) {
                typeNames.push(typeName);
            }
        }

        // If the pokemon has multiple past type changes, get the types names from the generation prior to the selected generation.
        if (pastTypes.length > 1) {
            let genIdToGetTypesFor: number;

            typesDifferentInGenIds.forEach((genId) => {
                if (genId < selectedGenerationId) {
                    genIdToGetTypesFor = genId;
                }
            });

            const genToGetTypesFor: Generation | undefined =
                typesDifferentInGens.find(g => g.id === genIdToGetTypesFor);

            if (genToGetTypesFor)
                for (let typeName of genToGetTypesFor.types.map(t => t.name as TypeName)) {
                    typeNames.push(typeName);
                }
        }

        if (typeNames.length === 0)
            throw new Error("Could not determine the pokemon's types.");

        const types: Type[] = [];
        for (let typeName of typeNames) {
            const type: Type = await this.pokemonClient.getTypeByName(typeName);
            types.push(type);
        }

        return types;
    }

    private mapToPokemonDomain(
        id: number,
        name: string,
        generationId: number,
        typeNames: TypeName[],
        defensiveDamageMultipliers: DamageMultipliers,
        sprite: string | null): PokemonDomain {

        let capitalizeNextCharacter = true; // Start with true to capitalize the first character.
        const displayName = name.replace(/-/g, " ").split("").map(char => {
            if (capitalizeNextCharacter) {
                char = char.toUpperCase(); // Capitalize the current character.
                capitalizeNextCharacter = false; // Reset for next character.
            }
            if (char === " ") {
                capitalizeNextCharacter = true;
            }
            return char;
        }).join(""); // Join the modified characters back into a string.

        const pokemonDomain: PokemonDomain = {
            id: id,
            name: name,
            displayName: displayName,
            generationId: generationId,
            typeNames: typeNames,
            defensiveDamageMultipliers: defensiveDamageMultipliers,
            sprite: sprite
        };

        return pokemonDomain;
    }
}
