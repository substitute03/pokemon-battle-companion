import { Type } from "pokenode-ts"
import { DamageMultipliers } from "./damageMultipliers"
import { GenerationName } from "./generationDomain"
import { TypeName } from "./typeDomain"
import { DefensiveDamageMultipliersDomain } from "./DefensiveDamageMultipliersDomain"

export interface PokemonDomain {
    id: number,
    name: string,
    displayName: string,
    generationId: number,
    typeNames: string[],
    defensiveDamageMultipliers: DefensiveDamageMultipliersDomain,
    sprite: string | null
}