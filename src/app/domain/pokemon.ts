export interface Pokemon {
    id: number,
    name: string,
    types: {
        slot: number,
        type: {
            name: string,
            url: string
        }
    }[],
    sprites: {
        other: {
            "official-artwork": {
                front_default: string
            }
        }
    }
}