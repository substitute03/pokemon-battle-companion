import { Component, OnInit, Renderer2, ElementRef, QueryList, ViewChildren } from '@angular/core';
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
    @ViewChildren('typeCell', { read: ElementRef }) typeCellElements: QueryList<ElementRef> | undefined;

    constructor(private _typeService: TypeService, private _generationService: GenerationService, private renderer: Renderer2) { }

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

    public onCellMouseEnter(r: number, c: number): void {
        this.typeCellElements
            ?.filter(cell => cell.nativeElement.getAttribute('row') === r.toString() ||
                cell.nativeElement.getAttribute('col') === c.toString())
            .forEach(cell => {
                this.renderer.removeClass(cell.nativeElement, 'type-cell');
                this.renderer.addClass(cell.nativeElement, 'type-cell-highlighted')
            });
    }

    public onCellMouseLeave(r: number, c: number): void {
        this.typeCellElements
            ?.filter(cell => cell.nativeElement.getAttribute('row') === r.toString() ||
                cell.nativeElement.getAttribute('col') === c.toString())
            .forEach(cell => {
                this.renderer.removeClass(cell.nativeElement, 'type-cell-highlighted');
                this.renderer.addClass(cell.nativeElement, 'type-cell')
            });
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
    }

    private async setDamageMultipliers(): Promise<void> {
        console.log("genId 2: " + new Date + this.selectedGenerationId);
        this.damageMultipliers = await this._typeService
            .getDefensiveMultipliersForAllTypesByGeneration(this.selectedGenerationId)

        this.types = this.damageMultipliers.flatMap(dm => dm.types);
    }
}
