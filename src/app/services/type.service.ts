import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, retry, distinct } from 'rxjs/operators';
import { Pokemon, Type } from "pokenode-ts";
import { allTypeNames, TypeName } from "../domain/typeDomain";
import { DamageMultipliers } from "../domain/damageMultipliers";
import { BuiltinTypeName } from "@angular/compiler";
import { GenerationName, isGenerationGreaterThanOrEqualTo } from "../domain/generationDomain";


@Injectable({
    providedIn: 'root'
})
export class TypeService {
    constructor(private http: HttpClient) { }

    public getTypeById(id: number): Observable<Type> {
        return this.http.get<Type>(`https://pokeapi.co/api/v2/type/${id}`);
    }

    public getTypeByName(name: string): Observable<Type> {
        return this.http.get<Type>(`https://pokeapi.co/api/v2/type/${name}`);
    }

    public getTypeByUrl(url: string): Observable<Type> {
        return this.http.get<Type>(url);
    }

    public getDefensiveDamageMultipliersForType(type: Type): DamageMultipliers {
        let defensiveMultipliers: DamageMultipliers = {
            four: [], two: [], one: [], half: [], quarter: [], zero: []
        };

        let addedTypes: TypeName[] = [];

        type.damage_relations.double_damage_from.forEach(type => {
            defensiveMultipliers.two.push(type.name as TypeName);
            addedTypes.push(type.name as TypeName);
        });

        type.damage_relations.half_damage_from.forEach(type => {
            defensiveMultipliers.half.push(type.name as TypeName);
            addedTypes.push(type.name as TypeName);
        });

        type.damage_relations.no_damage_from.forEach(type => {
            defensiveMultipliers.zero.push(type.name as TypeName);
            addedTypes.push(type.name as TypeName);
        });

        allTypeNames.forEach(typeName => {
            if (!addedTypes.includes(typeName)) {
                defensiveMultipliers.one.push(typeName);
            }
        });

        return defensiveMultipliers;
    }

    public getDefensiveDamageMultipliersForTypes(type1: Type, type2: Type): DamageMultipliers {
        let defensiveMultipliers: DamageMultipliers = {
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
            .subscribe(types => defensiveMultipliers.zero = types);

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

        // Use rxjs distnct() to get a distinct list of types from the zerMultiplierTypes array.


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

        let addedTypes = [
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
}
