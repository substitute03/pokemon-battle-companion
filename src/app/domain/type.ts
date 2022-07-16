export interface Type {
    name: TypeName,
    damage_relations: {
        double_damage_from: {
            name: TypeName,
            url: string
        }[],
        double_damage_to: {
            name: TypeName,
            url: string
        }[],
        half_damage_from: {
            name: TypeName,
            url: string
        }[],
        half_damage_to: {
            name: TypeName,
            url: string
        }[],
        no_damage_from: {
            name: TypeName,
            url: string
        }[],
        no_damage_to: {
            name: TypeName,
            url: string
        }[]
    }
}

export type TypeName = 'normal' | 'fighting' | 'flying' | 'poison' |
    'ground' | 'rock' | 'bug' | 'ghost' | 'steel' |
    'fire' | 'water' | 'grass' | 'electric' |
    'psychic' | 'ice' | 'dragon' | 'dark' | 'fairy';

export const allTypeNames: TypeName[] = [
    'normal', 'fighting', 'flying', 'poison',
    'ground', 'rock', 'bug', 'ghost', 'steel',
    'fire', 'water', 'grass', 'electric',
    'psychic', 'ice', 'dragon', 'dark', 'fairy'];