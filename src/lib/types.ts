export interface Ingredient {
  id: string;
  name: string;
  bk: number;
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  em: number;  // Energi Metabolisme (Kkal/kg)
  calcium: number;
  pricePerKg: number;
  maxSk?: number;
}

export interface NutritionalRequirement {
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  em: number;  // Energi Metabolisme (Kkal/kg)
  calcium: number;
}

export interface FormulaResult {
  ingredient: string;
  percentage: number;
  costPerKg: number;
  totalCost: number;
}

export interface FormulationResult {
  results: FormulaResult[];
  totalCost: number;
  nutritionalValues: NutritionalRequirement;
  warnings?: string[];
}
