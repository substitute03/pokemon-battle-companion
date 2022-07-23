import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { Pokemon, PokemonType } from '../domain/pokemon';
import { Type } from '../domain/type';
import { PokemonService } from '../services/pokemon.service';
import { TypeService } from '../services/type.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DamageMultipliers } from '../domain/damageMultipliers';
import { generationNameToNumber, isGenerationName, isGenerationGreaterThanOrEqualTo } from '../domain/generation';
import { GenerationService } from '../services/generation.service'
import { Types } from "pokenode-ts";

@Component({
    selector: 'pbc-pokemon-details',
    templateUrl: './pokemon-details.component.html',
    styleUrls: ['./pokemon-details.component.css']
})
export class PokemonDetailsComponent implements OnInit, OnDestroy {
    getAllPokemonSubscription!: Subscription;
    getPokemonSubscription!: Subscription;
    getPokemonTypeSubscription!: Subscription;

    public isLoading: boolean = false;
    public message: string = "";

    public allPokemonNames: string[] = [];
    public allGenerationNames: string[] = [];
    public pokemon: Pokemon | null = null;
    public pokemonTypes: Type[] = [];
    public displayingMultipliersForGeneration: string = "";
    public defensiveMultipliers: DamageMultipliers = {
        four: [], two: [], one: [], half: [], quarter: [], zero: []
    };

    public model: any;

    pokemonForm = new FormGroup({
        pokemonName: new FormControl('', [Validators.required]),
        generation: new FormControl('generation-viii'),
    });

    constructor(private _pokemonService: PokemonService,
        private _typeService: TypeService,
        private _generationService: GenerationService) { }

    ngOnInit(): void {
        this.getAllPokemonNames();
        this.getAllGenerationNames();
        this._pokemonService.getPokemonByNamePokenode("", 1);
    }

    ngOnDestroy(): void {
        this.getPokemonSubscription.unsubscribe;
        this.getPokemonTypeSubscription.unsubscribe;
        this.getAllPokemonSubscription.unsubscribe;
    }

    public async getAllPokemonNames() {
        this.allPokemonNames = await this._pokemonService.getAllPokemonNamesAsync();
    }

    public async getAllGenerationNames() {
        this.allGenerationNames = await this._generationService.getAllGenerationNamesAsync();
    }

    public getTypeMatchups() {
        if (this.pokemonForm.invalid) {
            this.pokemonForm.markAllAsTouched(); // Mark as touched to display validation if it is not already shown.
            return;
        }

        this.message = "";
        this.isLoading = true;
        this.pokemon = null;
        this.pokemonTypes = [];
        this.defensiveMultipliers.four = [];
        this.defensiveMultipliers.half = [];
        this.defensiveMultipliers.one = [];
        this.defensiveMultipliers.quarter = [];
        this.defensiveMultipliers.two = [];
        this.defensiveMultipliers.zero = [];

        let pokemonName: string = this.pokemonForm.get('pokemonName')?.value;

        // TODO: Make a service method to get pokemon by name and generation.
        this.getPokemonSubscription = this._pokemonService.getPokemonByName(pokemonName)
            .subscribe({
                next: receivedPokemon => {
                    this.pokemon = receivedPokemon;
                    this.getPokemonDefensiveMultipiers();
                    this.isLoading = false;
                },
                error: (error) => {
                    if (error.status === 404) {
                        console.log("Pokémon not found.");
                        this.message = "Pokémon not found.";
                        this.isLoading = false;
                    };
                }
            });
    }

    private getPokemonDefensiveMultipiers() {
        if (!this.pokemon) {
            return;
        };

        let selectedGeneration = this.pokemonForm.get('generation')?.value;

        if (!isGenerationName(selectedGeneration)) {
            throw new Error("Selected generation is not a real generation name.")
        }

        let pastTypesToUse: PokemonType[] = [];
        pastTypesToUse = this.pokemon.past_types
            .filter(pastType => isGenerationGreaterThanOrEqualTo(pastType.generation.name, selectedGeneration))
            .sort((a, b) => generationNameToNumber[a.generation.name] - generationNameToNumber[b.generation.name])[0]?.types;

        const typesToUse = pastTypesToUse || this.pokemon.types;

        if (pastTypesToUse) {
            this.displayingMultipliersForGeneration = "For Generation " + generationNameToNumber[selectedGeneration].toString();
        }
        else {
            this.displayingMultipliersForGeneration = "For Most Recent Generation";
        }

        typesToUse.forEach(typeToUse => {
            this.getPokemonSubscription = this._typeService.getTypeByUrl(typeToUse.type.url)
                .subscribe({
                    next: receivedType => {
                        this.pokemonTypes.push(receivedType);
                    },
                    complete: () => {
                        if (typesToUse) {
                            if (pastTypesToUse && pastTypesToUse.length === this.pokemonTypes.length) {
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
                            else if (this.pokemonTypes.length === this.pokemon?.types.length) {
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
                    }
                })
        });

    }

    searchPokemonNames: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2
                ? []
                : this.allPokemonNames
                    .filter(names => names.includes(term))
            )
        )
}
