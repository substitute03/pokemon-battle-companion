import { Component, OnInit } from '@angular/core';
import { DamageMultipliers } from '../domain/damageMultipliers';
import { TypeService } from "../services/type.service";
import { GenerationDomain } from '../domain/generationDomain';
import { GenerationService } from '../services/generation.service';

@Component({
    selector: 'pbc-type-chart',
    templateUrl: './type-chart.component.html',
    styleUrls: ['./type-chart.component.css']
})
export class TypeChartComponent implements OnInit {
    allGenerations: GenerationDomain[] = [];

    types: string[] = [];
    damageMultipliers: DamageMultipliers[] = [];
    selectedGenerationId: number = 0;

    constructor(private _typeService: TypeService, private _generationService: GenerationService) { }

    ngOnInit(): void {
        this.setData();
    }

    private async setData(): Promise<void> {
        await this.setGenerations();
        await this.setDamageMultipliers();
    }

    public doesContain(dmMultiplierTypes: string[], type: string): boolean {
        if (dmMultiplierTypes.find(dmt => dmt === type)) {
            return true;
        }

        return false;
    }

    private async setGenerations(): Promise<void> {
        this.allGenerations = await this._generationService.getAllGenerationsDomain();

        this.allGenerations.forEach(g => {
            console.log(g.number);
        });

        // Set the pre-selected gen to the latest one.
        this.selectedGenerationId = this.allGenerations
            .map(g => g.number)
            .sort((a, b) => b - a)[0];

        console.log("genId 1: " + new Date + this.selectedGenerationId)
    }

    private async setDamageMultipliers(): Promise<void> {
        console.log("genId 2: " + new Date + this.selectedGenerationId);
        this.damageMultipliers = await this._typeService
            .getDefensiveMultipliersForAllTypesByGeneration(9)

        this.types = this.damageMultipliers.flatMap(dm => dm.types);
    }
}
