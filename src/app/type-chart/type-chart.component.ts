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
    isLoading: boolean = false;
    frozenRowIndex: number = -1;
    frozenColumnIndex: number = -1;
    @ViewChildren('typeCell', { read: ElementRef }) typeCellElements: QueryList<ElementRef> | undefined;

    constructor(
        private _typeService: TypeService,
        private _generationService: GenerationService, private renderer: Renderer2) { }

    ngOnInit(): void {
        this.setData();
    }

    private async setData(): Promise<void> {
        await this.setGenerations();
        await this.setDamageMultipliers();
    }

    public onCellMouseEnter(r: number, c: number): void {
        if (this.frozenRowIndex === -1) {
            this.typeCellElements
                ?.filter(cell => cell.nativeElement.getAttribute('row') === r.toString())
                .forEach(cell => {
                    this.renderer.removeClass(cell.nativeElement, 'type-cell');
                    this.renderer.addClass(cell.nativeElement, 'type-cell-highlighted')
                });
        }

        if (this.frozenColumnIndex === -1) {
            this.typeCellElements
                ?.filter(cell => cell.nativeElement.getAttribute('col') === c.toString())
                .forEach(cell => {
                    this.renderer.removeClass(cell.nativeElement, 'type-cell');
                    this.renderer.addClass(cell.nativeElement, 'type-cell-highlighted')
                });
        }
    }

    public onCellMouseLeave(r: number, c: number): void {
        this.typeCellElements
            ?.filter(cell => cell.nativeElement.getAttribute('row') === r.toString() ||
                cell.nativeElement.getAttribute('col') === c.toString())
            .forEach(cell => {
                if (cell.nativeElement.getAttribute('row') !== this.frozenRowIndex.toString() &&
                    cell.nativeElement.getAttribute('col') !== this.frozenColumnIndex.toString()) {
                    this.renderer.removeClass(cell.nativeElement, 'type-cell-highlighted');
                    this.renderer.addClass(cell.nativeElement, 'type-cell')
                }
            });
    }

    public freezeRow(r: number): void {
        if (this.frozenRowIndex !== r && this.frozenRowIndex === -1) {
            this.frozenRowIndex = r;

            this.typeCellElements
                ?.filter(cell => cell.nativeElement.getAttribute('row') === r.toString())
                .forEach(cell => {
                    this.renderer.removeClass(cell?.nativeElement, 'type-cell-highlighted');
                    this.renderer.addClass(cell?.nativeElement, 'type-cell-frozen');
                });
        }
        else if (this.frozenRowIndex === r) {
            this.frozenRowIndex = -1;

            this.typeCellElements
                ?.filter(cell => cell.nativeElement.getAttribute('row') === r.toString() && cell.nativeElement.getAttribute('col') !== this.frozenColumnIndex.toString())
                .forEach(cell => {
                    this.renderer.removeClass(cell?.nativeElement, 'type-cell-frozen');
                    this.renderer.addClass(cell?.nativeElement, 'type-cell-highlighted');
                });
        }
    }

    public freezeColumn(c: number): void {
        if (this.frozenColumnIndex !== c && this.frozenColumnIndex === -1) {
            this.frozenColumnIndex = c;

            this.typeCellElements
                ?.filter(cell => cell.nativeElement.getAttribute('col') === c.toString())
                .forEach(cell => {
                    this.renderer.removeClass(cell?.nativeElement, 'type-cell-highlighted');
                    this.renderer.addClass(cell?.nativeElement, 'type-cell-frozen');
                });
        }
        else if (this.frozenColumnIndex === c) {
            this.frozenColumnIndex = -1;

            this.typeCellElements
                ?.filter(cell => cell.nativeElement.getAttribute('col') === c.toString() && cell.nativeElement.getAttribute('row') !== this.frozenRowIndex.toString())
                .forEach(cell => {
                    this.renderer.removeClass(cell?.nativeElement, 'type-cell-frozen');
                    this.renderer.addClass(cell?.nativeElement, 'type-cell-highlighted');
                });
        }
    }

    public freezeColumnRow(r: number, c: number) {
        if ((this.frozenColumnIndex === -1 && this.frozenRowIndex === -1) ||
            (this.frozenColumnIndex === c && this.frozenRowIndex === r)) {
            this.freezeColumn(c);
            this.freezeRow(r);
        }
    }

    public generationSelected(selectedGeneration: number): void {
        this.selectedGenerationId = selectedGeneration;
        this.setDamageMultipliers();
    }

    public getDamageText(attacker: string, defender: string): string {
        if (this.damageMultipliers
            .find(dm => dm.types[0] === defender)?.one
            .find(o => o === attacker)) {
            return "";
        }
        if (this.damageMultipliers
            .find(dm => dm.types[0] === defender)?.two
            .find(o => o === attacker)) {
            return "2";
        }
        if (this.damageMultipliers
            .find(dm => dm.types[0] === defender)?.half
            .find(o => o === attacker)) {
            return "½";
        }
        if (this.damageMultipliers
            .find(dm => dm.types[0] === defender)?.zero
            .find(zero => zero === attacker)) {
            return "0";
        }

        return ""
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
        this.isLoading = true;
        this.damageMultipliers = await this._typeService
            .getDefensiveMultipliersForAllTypesByGeneration(this.selectedGenerationId)

        const a = this.damageMultipliers;
        this.types = this.damageMultipliers.flatMap(dm => dm.types);
        this.isLoading = false;
    }
}
