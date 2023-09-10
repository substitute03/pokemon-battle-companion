import { Type } from "pokenode-ts"
import { DamageMultipliers } from "./damageMultipliers"
import { GenerationName } from "./generationDomain"
import { TypeName } from "./typeDomain"

export interface PokemonDomain {
    id: number,
    name: string,
    displayName: string,
    generationId: number,
    typeNames: string[],
    defensiveDamageMultipliers: DamageMultipliers,
    sprite: string | null
}