import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { Pokemon } from '../domain/pokemon';
import { Type } from '../domain/type';
import { PokemonService } from '../services/pokemon.service';
import { TypeService } from '../services/type.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DamageMultipliers } from '../domain/damageMultipliers';

@Component({
    selector: 'pbc-pokemon-details',
    templateUrl: './pokemon-details.component.html',
    styleUrls: ['./pokemon-details.component.css']
})
export class PokemonDetailsComponent implements OnInit, OnDestroy {
    getAllPokemonSubscription!: Subscription;
    getPokemonSubscription!: Subscription;
    getPokemonTypeSubscription!: Subscription;

    public allPokemonNames: string[] = [];
    public pokemon: Pokemon | null = null;
    public pokemonTypes: Type[] = [];
    public defensiveMultipliers: DamageMultipliers = {
        four: [], two: [], one: [], half: [], quarter: [], zero: []
    };

    public model: any;

    pokemonForm = new FormGroup({
        pokemonName: new FormControl(),
    });

    constructor(private _pokemonService: PokemonService, private _typeService: TypeService) { }

    ngOnInit(): void {
        this.getAllPokemonNames();
    }

    ngOnDestroy(): void {
        this.getPokemonSubscription.unsubscribe;
        this.getPokemonTypeSubscription.unsubscribe;
        this.getAllPokemonSubscription.unsubscribe;
    }

    public getAllPokemonNames() {
        this.getAllPokemonSubscription = this._pokemonService.getAllPokemon()
            .subscribe({
                next: resourceList => {
                    resourceList.results.forEach(result => {
                        this.allPokemonNames.push(result.name);
                    });
                },
                error: (error) => {
                    console.log(error);
                }
            });
    }

    public getTypeMatchups() {
        let pokemonName: string = this.pokemonForm.get('pokemonName')?.value;
        this.pokemon = null;
        this.pokemonTypes = [];
        this.defensiveMultipliers.four = [];
        this.defensiveMultipliers.half = [];
        this.defensiveMultipliers.one = [];
        this.defensiveMultipliers.quarter = [];
        this.defensiveMultipliers.two = [];
        this.defensiveMultipliers.zero = [];

        this.getPokemonSubscription = this._pokemonService.getPokemonByName(pokemonName)
            .subscribe({
                next: receivedPokemon => {
                    this.pokemon = receivedPokemon;

                    this.pokemon.types.forEach(type => {
                        this.getPokemonTypeSubscription = this._typeService.getTypeByUrl(type.type.url)
                            .subscribe({
                                next: receivedType => {
                                    this.pokemonTypes.push(receivedType);
                                },
                                complete: () => {
                                    if (this.pokemonTypes.length === this.pokemon?.types.length) {
                                        switch (this.pokemonTypes.length) {
                                            case 1: {
                                                this.defensiveMultipliers =
                                                    this._typeService.getDefensiveDamageMultipliersForType(this.pokemonTypes[0]);
                                                break;
                                            }
                                            case 2: {
                                                this.defensiveMultipliers =
                                                    this._typeService.getDefensiveDamageMultipliersForTypes(this.pokemonTypes[0], this.pokemonTypes[1]);
                                            }
                                        }
                                    }
                                }
                            });
                    });
                },
                error: (error) => {
                    if (error.status === 404) {
                        console.log("Pokemon not found")
                    };
                }
            });
    }

    searchPokemonNames: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2
                ? []
                : this.allPokemonNames
                    .filter(names => names.startsWith(term))
                    .slice(0, 10))
        )
}
