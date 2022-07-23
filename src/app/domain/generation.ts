import { Type } from "./type"

export interface Generation {
    id: number,
    numeral: string,
    types: Type[],
    name: string,
    url: string
}

export type GenerationName =
    "generation-i" |
    "generation-ii" |
    "generation-iii" |
    "generation-iv" |
    "generation-v" |
    "generation-vi" |
    "generation-vii" |
    "generation-viii"

export const allGenerationNames: GenerationName[] = [
    "generation-i",
    "generation-ii",
    "generation-iii",
    "generation-iv",
    "generation-v",
    "generation-vi",
    "generation-vii",
    "generation-viii"];

export const generationNameToNumber: Record<GenerationName, number> = {
    "generation-i": 1,
    "generation-ii": 2,
    "generation-iii": 3,
    "generation-iv": 4,
    "generation-v": 5,
    "generation-vi": 6,
    "generation-vii": 7,
    "generation-viii": 8
}

export function isGenerationGreaterThanOrEqualTo(nameToTest: GenerationName, isGreaterThanOrEqualToName: GenerationName): boolean {
    if (generationNameToNumber[nameToTest] >= generationNameToNumber[isGreaterThanOrEqualToName]) {
        return true;
    }

    return false;
}

export function isGenerationName(obj: unknown): obj is GenerationName {
    const generationName = obj as GenerationName;
    return allGenerationNames.includes(generationName);
}
