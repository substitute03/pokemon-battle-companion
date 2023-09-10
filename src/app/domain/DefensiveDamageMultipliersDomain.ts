import { Type } from "pokenode-ts";
import { TypeService } from "../services/type.service";
import { DamageMultipliers } from "./damageMultipliers";

export class DefensiveDamageMultipliersDomain {
    public readonly generationId: number;

    public get type1Name(): string {
        if (this.type1) {
            return this.type1.name;
        }
        else {
            return "";
        }
    }

    public get type2Name(): string {
        if (this.type2) {
            return this.type2.name;
        }
        else {
            return "";
        }
    }

    private type1DamageMultipliers: DamageMultipliers | undefined;
    private type2DamageMultipliers: DamageMultipliers | undefined;
    private readonly type1: Type;
    private readonly type2: Type | undefined;

    constructor(type1: Type, type2: Type | undefined, generationId: number, private _typeService: TypeService) {
        this.type1 = type1;
        this.type2 = type2;
        this.generationId = generationId;
        this.getDamageMultipliers();
    }

    private async getDamageMultipliers(): Promise<void> {
        let methodsToRun: Promise<void>[] =
            [this.getMultipliersForType1()];

        if (this.type2) {
            methodsToRun.push(this.getMultipliersForType2())
        }

        await Promise.all(methodsToRun);
    }

    private async getMultipliersForType1(): Promise<void> {
        this.type1DamageMultipliers = await this._typeService
            .getDefensiveDamageMultipliersByGeneration([this.type1], this.generationId);
    }

    private async getMultipliersForType2(): Promise<void> {
        this.type1DamageMultipliers = await this._typeService
            .getDefensiveDamageMultipliersByGeneration([this.type2!], this.generationId);
    }
}