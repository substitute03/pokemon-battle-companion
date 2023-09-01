import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, retry, distinct } from 'rxjs/operators';
import { Pokemon, Type, PokemonClient, MainClient, TypeRelations, Generation } from "pokenode-ts";
import { allTypeNames, TypeName } from "../domain/typeDomain";
import { DamageMultipliers } from "../domain/damageMultipliers";
import { PastDamageRelationsDomain } from "../domain/pastDamageRelationsDomain";
import { type } from "os";

@Injectable({
    providedIn: 'root'
})
export class TypeService {
    private readonly pokemonClient: PokemonClient;
    private readonly mainClient: MainClient;

    constructor(private http: HttpClient) {
        this.pokemonClient = new PokemonClient();
        this.mainClient = new MainClient();
    }

    public async getDefensiveDamageMultipliersByGeneration(types: Type[], generationId: number): Promise<DamageMultipliers> {
        if (types.length === 1) {
            return await this.getDefensiveDamageMultipliersForType((types[0]), generationId);
        }
        else if (types.length === 2) {
            return await this.getDefensiveDamageMultipliersForTypes(types[0], types[1], generationId);
        }

        throw new Error("Could not calculate damage multipliers. Unknown number of types provided.");
    }

    public async getDefensiveMultipliersForAllTypesByGeneration(generationId: number): Promise<DamageMultipliers[]> {
        const allTypes: Type[] = await this.getAllTypes();

        let typesInGen: Type[] = [];
        for (let i = 0; i < allTypes.length; i++) {
            let typeAddedInGen = await this.getTypeAddedInGenerationId(allTypes[i].name);
            if (typeAddedInGen <= generationId) {
                typesInGen.push(allTypes[i]);
            }
        }

        let damageMultipliersForAllTypes: DamageMultipliers[] = [];
        for (let typeIndex = 0; typeIndex < typesInGen.length; typeIndex++) {
            const damageMultipliers = await this.getDefensiveDamageMultipliersByGeneration([typesInGen[typeIndex]], generationId);

            damageMultipliersForAllTypes.push(damageMultipliers);
        }

        return damageMultipliersForAllTypes;
    }

    public async getAllTypes(): Promise<Type[]> {
        let types: Type[] = [];
        let allTypeNames: string[] = await this.getAllTypeNames();
        for (let i = 0; i < allTypeNames.length; i++) {
            types.push(await this.pokemonClient.getTypeByName(allTypeNames[i]));
        }

        return types;
    }

    private async getAllTypeNames(): Promise<string[]> {
        // Get URLs for all types from the Types Named Resource
        const typeUrls = (await this.pokemonClient.listTypes()).results.map(r => r.url);

        // Get the Types from the API for each URL.
        let types: Type[] = [];
        for (let i = 0; i < typeUrls.length; i++) {
            let type: Type = (await firstValueFrom(this.http.get<Type>(`${typeUrls[i]}`)));
            types.push(type);
        }

        // Filter out any Type with an id > 10000 as these are not mainline types.
        const mainlineTypeNames: string[] = types.filter(t => t.id < 10000).map(t => t.name);

        return mainlineTypeNames;
    }

    private async getPastDamageRelationsDomainAsync(typeId: number): Promise<PastDamageRelationsDomain[]> {
        const type: Type = await firstValueFrom(
            this.http.get<Type>(`https://pokeapi.co/api/v2/type/${typeId}/`));

        return type.past_damage_relations;
    }

    private async getTypeAddedInGenerationId(typeName: string): Promise<number> {
        const typeAddedInGenName: string =
            (await this.pokemonClient.getTypeByName(typeName)).generation.name;

        const typeAddedInGenId: number =
            (await this.mainClient.game.getGenerationByName(typeAddedInGenName)).id

        return typeAddedInGenId;
    }

    private async getDefensiveDamageMultipliersForType(type: Type, selectedGenId: number): Promise<DamageMultipliers> {
        let defensiveMultipliers: DamageMultipliers = {
            types: [type.name as TypeName], four: [], two: [], one: [], half: [], quarter: [], zero: []
        };

        let processedTypes: TypeName[] = [];
        let damageRelationsDifferentInGens: Generation[] = [];

        const currentDamageRelations: TypeRelations =
            type.damage_relations;

        const pastDamageRelations: PastDamageRelationsDomain[] =
            (await this.getPastDamageRelationsDomainAsync(type.id));

        // Determine which (if any) generationss had different damage multipliers for the type.
        for (let damageRelation of pastDamageRelations) {
            let pastGen: Generation = await this.mainClient.game
                .getGenerationByName(damageRelation.generation.name);

            damageRelationsDifferentInGens.push(pastGen);
        }

        let damageRelationsToUse: TypeRelations;

        // If there are no past damage relations, or the selected generation is greater than the
        // latest generation that the damage multipliers change in.
        if ((pastDamageRelations.length === 0) ||
            (selectedGenId > Math.max(...damageRelationsDifferentInGens.map(g => g.id)))) {
            // Use the most recent damage relations.
            damageRelationsToUse = currentDamageRelations;
        }
        else {
            // Get the damage relations from the appropriate past
            // generation based on the selected generation id.
            damageRelationsToUse = this.calculatePastDamageRelationsToUse(
                pastDamageRelations,
                selectedGenId,
                damageRelationsDifferentInGens);
        }

        if (damageRelationsToUse) {
            // Calculate double damage from.
            for (const type of damageRelationsToUse.double_damage_from) {
                const typeAddedInGenId: number =
                    await this.getTypeAddedInGenerationId(type.name as TypeName);

                if (selectedGenId >= typeAddedInGenId) {
                    defensiveMultipliers.two.push(type.name as TypeName);
                }

                processedTypes.push(type.name as TypeName);
            }

            // Calculate half damage from.
            for (const type of damageRelationsToUse.half_damage_from) {
                const typeAddedInGenId: number =
                    await this.getTypeAddedInGenerationId(type.name as TypeName);

                if (selectedGenId >= typeAddedInGenId) {
                    defensiveMultipliers.half.push(type.name as TypeName);
                }

                processedTypes.push(type.name as TypeName);
            }

            // Calculate zero damage from.
            for (const type of damageRelationsToUse.no_damage_from) {
                const typeAddedInGenId: number =
                    await this.getTypeAddedInGenerationId(type.name as TypeName);

                if (selectedGenId >= typeAddedInGenId) {
                    defensiveMultipliers.zero.push(type.name as TypeName);
                }

                processedTypes.push(type.name as TypeName);
            }

            // Calculate x1 damage from.
            // Add all types that have not been processed that exist in the selected generation.
            for (const typeName of allTypeNames) {
                const typeAddedInGenId: number =
                    await this.getTypeAddedInGenerationId(typeName);

                if (!processedTypes.includes(typeName) && typeAddedInGenId <= selectedGenId) {
                    defensiveMultipliers.one.push(typeName);
                }
            }
        }

        return defensiveMultipliers;
    }

    private async getDefensiveDamageMultipliersForTypes(type1: Type, type2: Type, selectedGenId: number): Promise<DamageMultipliers> {
        let defensiveMultipliers: DamageMultipliers = {
            types: [type1.name as TypeName, type2.name as TypeName],
            four: [], two: [], one: [], half: [], quarter: [], zero: []
        };

        let zeroMultiplierTypes: TypeName[] = [];
        type1.damage_relations.no_damage_from.forEach(type => {
            zeroMultiplierTypes.push(type.name as TypeName);
        });
        type2.damage_relations.no_damage_from.forEach(type => {

            zeroMultiplierTypes.push(type.name as TypeName);
        });

        of(zeroMultiplierTypes)
            .pipe(distinct())
            .subscribe(types => defensiveMultipliers.zero = types)
            .unsubscribe();

        let twoMultplierTypes: TypeName[] = [];
        type1.damage_relations.double_damage_from.forEach(type => {
            if (!zeroMultiplierTypes.includes(type.name as TypeName)) {
                twoMultplierTypes.push(type.name as TypeName);
            };
        });
        type2.damage_relations.double_damage_from.forEach(type => {
            if (!zeroMultiplierTypes.includes(type.name as TypeName)) {
                twoMultplierTypes.push(type.name as TypeName);
            };
        });

        let halfMultiplierTypes: TypeName[] = [];
        type1.damage_relations.half_damage_from.forEach(type => {
            if (!zeroMultiplierTypes.includes(type.name as TypeName)) {
                halfMultiplierTypes.push(type.name as TypeName);
            };
        });
        type2.damage_relations.half_damage_from.forEach(type => {
            if (!zeroMultiplierTypes.includes(type.name as TypeName)) {
                halfMultiplierTypes.push(type.name as TypeName);
            };
        });

        // Calculate two and four defensive multipliers
        allTypeNames.forEach(typeName => {
            if (twoMultplierTypes.filter(t => t === typeName).length === 1) {
                defensiveMultipliers.two.push(typeName);
            }

            if (twoMultplierTypes.filter(t => t === typeName).length === 2) {
                defensiveMultipliers.four.push(typeName);
            }
        });

        // Calculate half and quarter defensive multipliers
        allTypeNames.forEach(typeName => {
            if (halfMultiplierTypes.filter(t => t === typeName).length === 1) {
                defensiveMultipliers.half.push(typeName);
            }

            if (halfMultiplierTypes.filter(t => t === typeName).length === 2) {
                defensiveMultipliers.quarter.push(typeName);
            }
        });

        const addedTypes = [
            ...defensiveMultipliers.two,
            ...defensiveMultipliers.four,
            ...defensiveMultipliers.half,
            ...defensiveMultipliers.quarter,
            ...defensiveMultipliers.zero];

        allTypeNames.forEach(typeName => {
            if (!addedTypes.includes(typeName)) {
                defensiveMultipliers.one.push(typeName);
            }
        });

        return defensiveMultipliers;
    }

    private calculatePastDamageRelationsToUse(pastDamageRelations: PastDamageRelationsDomain[],
        selectedGenId: number, damageRelationsDifferentInGens: Generation[]): TypeRelations {
        // Note: by this point, it is already confirmed that
        // the selected genId is less that the max past genId.

        // Sort by gen id descending.
        damageRelationsDifferentInGens
            .sort((genA, genB): number => genA.id - genB.id);

        // Loop through the generations (which are sorted by id descending) until the
        // selected gen id is greater than the gen id in the list of past generations.
        let genToUse: Generation;
        for (let gen of damageRelationsDifferentInGens) {
            if (selectedGenId >= gen.id) {
                genToUse = gen;
                break;
            }
        }

        return pastDamageRelations
            .filter(pdr => pdr.generation?.name === genToUse?.name)
            .map(pdr => pdr.damage_relations)[0];
    }
}
