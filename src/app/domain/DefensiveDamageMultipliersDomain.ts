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

    public zero: string[] = [];
    public quarter: string[] = [];
    public half: string[] = [];
    public one: string[] = [];
    public two: string[] = [];
    public four: string[] = [];

    private type1DamageMultipliers: DamageMultipliers | undefined;
    private type2DamageMultipliers: DamageMultipliers | undefined;
    private readonly type1: Type | undefined; // Types will be passed from the PokemonDomain
    private readonly type2: Type | undefined;

    constructor(
        type1: Type, type2: Type | undefined, generationId: number,
        type1Multipliers: DamageMultipliers,
        type2Multipliers: DamageMultipliers | undefined) {
        this.type1 = type1;
        this.type2 = type2;
        this.generationId = generationId;
        this.type1DamageMultipliers = type1Multipliers;
        this.type2DamageMultipliers = type2Multipliers;
        this.setDamageMultipliers();
    }

    private async setDamageMultipliers(): Promise<void> {
        // If this is a dual type, ammend the multipliers accordingly.
        if (this.type2) {
            this.calculateDualTypeDamageMultipliers();
        }
        else {
            this.zero = this.type1DamageMultipliers!.zero;
            this.quarter = this.type1DamageMultipliers!.quarter;
            this.half = this.type1DamageMultipliers!.half;
            this.one = this.type1DamageMultipliers!.one;
            this.two = this.type1DamageMultipliers!.two;
        }
    }

    private calculateDualTypeDamageMultipliers(): void {
        const allTypes: string[] = [
            ...this.type1DamageMultipliers!.zero,
            ...this.type1DamageMultipliers!.half,
            ...this.type1DamageMultipliers!.one,
            ...this.type1DamageMultipliers!.two]

        for (const typeName of allTypes) {
            // If the type is in zero for either type, it is always zero.
            if (this.type2DamageMultipliers!.zero.find(zero => zero === typeName) ||
                this.type1DamageMultipliers!.zero.find(zero => zero === typeName)) {
                this.zero.push(typeName);
                continue;
            }

            if (this.multiplierContains(this.type1DamageMultipliers!.half, typeName)) {
                if (this.multiplierContains(this.type2DamageMultipliers!.half, typeName)) {
                    this.quarter.push(typeName);
                }
                else if (this.multiplierContains(this.type2DamageMultipliers!.one, typeName)) {
                    this.one.push(typeName);
                }
                else if (this.multiplierContains(this.type2DamageMultipliers!.two, typeName)) {
                    this.one.push(typeName);
                }
            }

            if (this.multiplierContains(this.type1DamageMultipliers!.one, typeName)) {
                if (this.multiplierContains(this.type2DamageMultipliers!.half, typeName)) {
                    this.half.push(typeName);
                }
                else if (this.multiplierContains(this.type2DamageMultipliers!.one, typeName)) {
                    this.one.push(typeName);
                }
                else if (this.multiplierContains(this.type2DamageMultipliers!.two, typeName)) {
                    this.two.push(typeName);
                }
            }

            if (this.multiplierContains(this.type1DamageMultipliers!.two, typeName)) {
                if (this.multiplierContains(this.type2DamageMultipliers!.half, typeName)) {
                    this.one.push(typeName);
                }
                else if (this.multiplierContains(this.type2DamageMultipliers!.one, typeName)) {
                    this.two.push(typeName);
                }
                else if (this.multiplierContains(this.type2DamageMultipliers!.two, typeName)) {
                    this.four.push(typeName);
                }
            }
        }
    }

    private clearDamageMultipliers(): void {
        this.zero = [];
        this.quarter = [];
        this.half = [];
        this.one = [];
        this.two = [];
        this.four = [];
    }

    private multiplierContains(multiplierGroup: string[], typeName: string): boolean {
        if (multiplierGroup.find(g => g === typeName)) {
            return true;
        }

        return false;
    }
}