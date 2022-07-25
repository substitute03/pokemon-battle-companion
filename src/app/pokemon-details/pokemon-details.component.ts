import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { GenerationName } from '../domain/generationDomain';
import { PokemonService } from '../services/pokemon.service';
import { TypeService } from '../services/type.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DamageMultipliers } from '../domain/damageMultipliers';
import { generationNameToNumber, isGenerationName, isGenerationGreaterThanOrEqualTo } from '../domain/generationDomain';
import { GenerationService } from '../services/generation.service'
import { Type, Pokemon, PokemonType } from "pokenode-ts";
import { PokemonDomain } from '../domain/pokemonDomain';

@Component({
    selector: 'pbc-pokemon-details',
    templateUrl: './pokemon-details.component.html',
    styleUrls: ['./pokemon-details.component.css']
})
export class PokemonDetailsComponent implements OnInit, OnDestroy {


    public isLoading: boolean = false;
    public message: string = "";
    public allPokemonNames: string[] = [];
    public pokemon: PokemonDomain | null = null;
    public pokemonTypes: Type[] = [];
    public displayingMultipliersForGeneration: string = "";
    public defensiveMultipliers: DamageMultipliers = {
        four: [], two: [], one: [], half: [], quarter: [], zero: []
    };

    public model: any;

    pokemonForm = new FormGroup({
        pokemonName: new FormControl('', [Validators.required]),
        generation: new FormControl('8'),
    });

    constructor(private _pokemonService: PokemonService) { }

    ngOnInit(): void {
        this.getAllPokemonNames();
    }

    ngOnDestroy(): void { }

    public async getAllPokemonNames() {
        this.allPokemonNames = await this._pokemonService.getAllPokemonNamesAsync();
    }

    public async getPokemonDetails() {
        if (this.pokemonForm.invalid) {
            this.pokemonForm.markAllAsTouched(); // Mark as touched to display validation if it is not already shown.
            return;
        }

        this.resetPage();

        const pokemonName: string = this.pokemonForm.get('pokemonName')?.value;
        const selectedGenId: number = parseInt(this.pokemonForm.get('generation')?.value);

        this.pokemon = await this._pokemonService
            .getPokemonByGeneration(pokemonName, selectedGenId);

        if (this.pokemon === null) {
            this.message = "Pokémon did not exist in generation " + selectedGenId;
        }

        this.isLoading = false;
    }

    private resetPage(): void {
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
