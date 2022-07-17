import { GenerationName } from "./generation"
import { TypeName } from "./type"

export interface Pokemon {
    id: number,
    name: string,
    types: PokemonType[],
    past_types: {
        generation: {
            name: GenerationName,
            url: string
        },
        types: PokemonType[]
    }[],
    sprites: {
        other: {
            "official-artwork": {
                front_default: string
            }
        }
    }
}

export interface PokemonType {
    slot: number,
    type: {
        name: TypeName,
        url: string
    }
}