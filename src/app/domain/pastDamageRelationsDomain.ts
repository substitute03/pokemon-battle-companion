import { TypeRelations, NamedAPIResource } from "pokenode-ts";
/** Contains the damage relations from previous generations.
 *  This is not currently in pokenode-ts so implemented it
 *  separately using poknode-ts models to model the 
//  *  past_damage_relations from pokeAPI */
// export interface PastDamageRelationsDomain {
//     past_damage_relations: {
//         /** The generation of this Pokémon Type. */
//         generation: NamedAPIResource;
//         /** A detail of how effective this type is toward others and vice versa in a previous generation */
//         damage_relations: TypeRelations;
//     }[]
// }


export interface PastDamageRelationsDomain {
    /** The generation of this Pokémon Type. */
    generation: NamedAPIResource;
    /** A detail of how effective this type is toward others and vice versa in a previous generation */
    damage_relations: TypeRelations;
}

// export type PastDamageRelationsDomain = {
//     /** The generation of this Pokémon Type. */
//     generation: NamedAPIResource;
//     /** A detail of how effective this type is toward others and vice versa in a previous generation */
//     damage_relations: TypeRelations;
// }[]