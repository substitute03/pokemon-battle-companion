import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { GenerationDomain } from '../domain/generationDomain';
import { GenerationService } from '../services/generation.service';

@Component({
    selector: 'pbc-generation-picker',
    templateUrl: './generation-picker.component.html',
    styleUrls: ['./generation-picker.component.css']
})
export class GenerationPickerComponent implements OnInit {
    public allGenerations: GenerationDomain[] = [];
    public selectedGeneration: number | undefined;
    @Output() generationSelected: EventEmitter<number> = new EventEmitter<number>();

    constructor(private _generationService: GenerationService, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.getAllGenerationsDomain();
    }

    public async getAllGenerationsDomain() {
        this.allGenerations = await this._generationService.getAllGenerationsDomain();

        const latestGeneration: number = this.allGenerations
            .flatMap(g => g.number)
            .sort((a, b) => b - a)[0];

        this.selectGeneration(latestGeneration);
    }

    public selectGeneration(generation: number): void {
        if (this.selectedGeneration !== generation) {
            this.selectedGeneration = generation;
            this.generationSelected.emit(generation);
            this.changeDetectorRef.detectChanges();
        }
    }
}
