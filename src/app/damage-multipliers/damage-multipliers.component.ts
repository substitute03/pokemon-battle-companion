import { Component, Input, OnInit } from '@angular/core';
import { PokemonDomain } from '../domain/pokemonDomain';

@Component({
    selector: 'pbc-damage-multipliers',
    templateUrl: './damage-multipliers.component.html',
    styleUrls: ['./damage-multipliers.component.css']
})
export class DamageMultipliersComponent implements OnInit {

    @Input() public pokemon: PokemonDomain | null = null;

    constructor() { }

    ngOnInit(): void {
    }

}
