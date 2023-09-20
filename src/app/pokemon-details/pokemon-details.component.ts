import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { GenerationDomain, GenerationName } from '../domain/generationDomain';
import { PokemonService } from '../services/pokemon.service';
import { TypeService } from '../services/type.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { DamageMultipliers } from '../domain/damageMultipliers';
import { generationNameToNumber, isGenerationName, isGenerationGreaterThanOrEqualTo } from '../domain/generationDomain';
import { GenerationService } from '../services/generation.service'
import { Type, Pokemon, PokemonType } from "pokenode-ts";
import { PokemonDomain } from '../domain/pokemonDomain';
import { allTypeNames, TypeName } from "../domain/typeDomain";

@Component({
    selector: 'pbc-pokemon-details',
    templateUrl: './pokemon-details.component.html',
    styleUrls: ['./pokemon-details.component.css']
})
export class PokemonDetailsComponent implements OnInit, OnDestroy {
    public isLoading: boolean = false;
    public message: string = "";
    public allPokemonNames: string[] = [];
    public allGenerations: GenerationDomain[] = [];
    public pokemon: PokemonDomain | null = null;
    public pokemonTypes: Type[] = [];
    public displayingMultipliersForGeneration: string = "";
    public model: any;

    pokemonForm = new FormGroup({
        pokemonName: new FormControl('', [Validators.required]),
        generation: new FormControl([Validators.required]),
    });

    constructor(private _pokemonService: PokemonService, private _generationService: GenerationService, private _typeService: TypeService) { }

    ngOnInit(): void {
        this.getAllPokemonNames();
        this.getAllGenerationsDomain();
    }

    ngOnDestroy(): void { }

    public async getAllPokemonNames() {
        this.allPokemonNames = await this._pokemonService.getAllPokemonNamesAsync();
    }

    public async getAllGenerationsDomain() {
        this.allGenerations = await this._generationService.getAllGenerationsDomain();

        const latestGeneration: number = this.allGenerations
            .flatMap(g => g.number)
            .sort((a, b) => b - a)[0];

        this.pokemonForm.get("generation")?.setValue(latestGeneration);
    }

    public isSelectedGeneration(generationNumber: number): boolean {
        const selectedGenId = parseInt(this.pokemonForm.get('generation')?.value);
        return selectedGenId === generationNumber;
    }

    public generationSelected(selectedGeneration: number): void {
        this.pokemonForm.get("generation")?.setValue(selectedGeneration);
    }

    public async getPokemonDetails() {
        if (!this.allPokemonNames.includes(this.pokemonForm.get("pokemonName")?.value)) {
            this.message = "Please choose a name from the suggested options"
            return;
        }

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

        this.displayingMultipliersForGeneration = selectedGenId.toString();
        this.isLoading = false;
    }

    private resetPage(): void {
        this.message = "";
        this.isLoading = true;
        this.pokemon = null;
        this.pokemonTypes = [];
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
