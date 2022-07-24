import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, interval, firstValueFrom } from 'rxjs';
import { Pokemon, PokemonClient, NamedAPIResourceList, MainClient, PokemonForm, Types, Generation, PokemonPastType, PokemonType, Generations } from "pokenode-ts";
import { PokemonDomain } from "../domain/pokemonDomain";
import { TypeName } from "../domain/typeDomain";

@Injectable({
    providedIn: 'root'
})
export class PokemonService {
    // private readonly pokeApi: MainClient;
    private readonly pokemonClient: PokemonClient;
    private readonly mainClient: MainClient;

    constructor(private http: HttpClient) {
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

        const pokemonTypeNames: TypeName[] =
            await this.getPokemonTypeNamesByGeneration(pokemonApi, selectedGenerationId);

        // map pokemon to api
        // const domainPokemon = mapToDomainPokemon(pokemonApi);

        let a: PokemonDomain | null = null;
        return a;
    }

    private async getPokemonTypeNamesByGeneration(
        pokemonApi: Pokemon,
        selectedGenerationId: number,
    ): Promise<TypeName[]> {
        const pastTypes: PokemonPastType[] = pokemonApi.past_types;
        const currentTypes: PokemonType[] = pokemonApi.types;

        // The selected generation will always be higher than the introduced in generation at this point.
        // Note that a pokemon's past types work in "reverse order". E.g. Wigglytuff was changed to normal/fairy
        // in gen 6 so its past types array would contain "gen 5 - normal"

        // If the pokemon has past types, get the generation ids of when their typing was different to their current typing.
        let typesDifferentInGenIds: number[] = [];
        let typesDifferentInGens: Generation[] = [];

        for (const pastType of pastTypes) {
            const generation: Generation =
                await this.mainClient.game.getGenerationByName(pastType.generation.name);

            typesDifferentInGens.push(generation);
            typesDifferentInGenIds.push(generation.id);
        }

        // Sort by descending so most recent gen id is on top.
        typesDifferentInGenIds.sort((n1, n2) => n1 - n2);

        // If the pokemon has no past types, or if the selected generation is
        // greater than the most recent type change, return the mon's current types.
        if ((pastTypes.length === 0) ||
            (selectedGenerationId > Math.max(...typesDifferentInGens.map(x => x.id)))) {
            return currentTypes.map(ct => ct.type.name as TypeName);
        }


        // If the types have only changed once and selected generation is less than or equal to the most recent type change,
        // return the types from the earlier generation.
        // TODO: This scenario may be covered by the i
        if (pastTypes.length === 1 &&
            selectedGenerationId <= Math.max(...typesDifferentInGens.map(x => x.id))) {
            let a = pastTypes[0].types.map(t => t.type.name as TypeName);
            return a;
        }

        // If the pokemon has multiple past type changes, return the types from the generation prior to the selected generation.
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
                return genToGetTypesFor.types.map(t => t.name as TypeName);
        }

        throw new Error("Could not determine the pokemon's types.");
    }
}
