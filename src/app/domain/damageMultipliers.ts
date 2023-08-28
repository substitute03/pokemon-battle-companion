import { TypeName } from "./typeDomain"

export interface DamageMultipliers {
    types: TypeName[];
    four: TypeName[],
    two: TypeName[],
    one: TypeName[],
    half: TypeName[],
    quarter: TypeName[],
    zero: TypeName[]
}