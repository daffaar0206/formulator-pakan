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

// Define maximum thresholds as percentages of requirements
const MAX_NUTRIENT_THRESHOLDS = {
  pk: 1.02,  // Max 102% of requirement (very tight limit for PK)
  lk: 1.15,  // Max 115% of requirement
  sk: 1.15,  // Max 115% of requirement
  tdn: 1.15, // Max 115% of requirement
  em: 1.15,  // Max 115% of requirement
  calcium: 1.15, // Max 115% of requirement
};

// Define minimum thresholds as percentages of requirements
const MIN_NUTRIENT_THRESHOLDS = {
  pk: 0.98,  // Min 98% of requirement (tight range for PK)
  lk: 0.85,  // Min 85% of requirement
  sk: 0.90,  // Min 90% of requirement
  tdn: 0.85, // Min 85% of requirement
  em: 0.85,  // Min 85% of requirement
  calcium: 0.85, // Min 85% of requirement
};

export const calculateNutritionalValues = (
  ingredients: Ingredient[],
  percentages: Record<string, number>,
): NutritionalRequirement => {
  const totals = {
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  };

  ingredients.forEach((ingredient) => {
    const percentage = percentages[ingredient.name] || 0;
    totals.pk += (ingredient.pk * percentage) / 100;
    totals.lk += (ingredient.lk * percentage) / 100;
    totals.sk += (ingredient.sk * percentage) / 100;
    totals.tdn += (ingredient.tdn * percentage) / 100;
    totals.em += (ingredient.em * percentage) / 100;
    totals.calcium += (ingredient.calcium * percentage) / 100;
  });

  return totals;
};

export const calculateFormulation = (
  ingredients: Ingredient[],
  requirements: NutritionalRequirement,
): FormulationResult => {
  // Define percentage limits
  const MIN_INGREDIENT_PERCENTAGE = 5;  // Minimum 5% per ingredient
  const MAX_INGREDIENT_PERCENTAGE = 30; // Maximum 30% per ingredient

  let remainingPercentage = 100;
  let results: FormulaResult[] = [];
  let totalCost = 0;
  
  let cumulativeNutrients = {
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  };

  // Calculate maximum allowed values
  const maxAllowed = {
    pk: requirements.pk * MAX_NUTRIENT_THRESHOLDS.pk,
    lk: requirements.lk * MAX_NUTRIENT_THRESHOLDS.lk,
    sk: requirements.sk * MAX_NUTRIENT_THRESHOLDS.sk,
    tdn: requirements.tdn * MAX_NUTRIENT_THRESHOLDS.tdn,
    em: requirements.em * MAX_NUTRIENT_THRESHOLDS.em,
    calcium: requirements.calcium * MAX_NUTRIENT_THRESHOLDS.calcium,
  };

  // Sort ingredients by balanced nutrient contribution
  const sortedIngredients = [...ingredients].sort((a, b) => {
    // Calculate nutrient balance scores
    const getNutrientScore = (ing: Ingredient) => {
      const pkScore = Math.min(ing.pk / requirements.pk, 1.1);
      const tdnScore = ing.tdn / requirements.tdn;
      const emScore = ing.em / requirements.em;
      const calciumScore = ing.calcium / requirements.calcium;
      
      // Encourage ingredients that contribute multiple nutrients
      const balanceScore = (
        (pkScore > 0 ? 1 : 0) +
        (tdnScore > 0 ? 1 : 0) +
        (emScore > 0 ? 1 : 0) +
        (calciumScore > 0 ? 1 : 0)
      );

      return (pkScore + tdnScore + emScore + calciumScore) * balanceScore / ing.pricePerKg;
    };

    return getNutrientScore(b) - getNutrientScore(a);
  });

  while (remainingPercentage > MIN_INGREDIENT_PERCENTAGE) {
    const deficits = {
      pk: Math.max(0, requirements.pk - cumulativeNutrients.pk),
      lk: Math.max(0, requirements.lk - cumulativeNutrients.lk),
      sk: Math.max(0, requirements.sk - cumulativeNutrients.sk),
      tdn: Math.max(0, requirements.tdn - cumulativeNutrients.tdn),
      em: Math.max(0, requirements.em - cumulativeNutrients.em),
      calcium: Math.max(0, requirements.calcium - cumulativeNutrients.calcium),
    };

    // Check if we've met all requirements
    if (Object.values(deficits).every(v => v === 0)) break;

    let bestIngredient = null;
    let bestPercentage = 0;

    for (const ingredient of sortedIngredients) {
      if (results.some(r => r.ingredient === ingredient.name)) continue;

      // Calculate maximum percentage that won't exceed any nutrient limit
      const maxPercentages = {
        pk: ((maxAllowed.pk - cumulativeNutrients.pk) * 100) / ingredient.pk,
        lk: ((maxAllowed.lk - cumulativeNutrients.lk) * 100) / ingredient.lk,
        sk: ((maxAllowed.sk - cumulativeNutrients.sk) * 100) / ingredient.sk,
        tdn: ((maxAllowed.tdn - cumulativeNutrients.tdn) * 100) / ingredient.tdn,
        em: ((maxAllowed.em - cumulativeNutrients.em) * 100) / ingredient.em,
        calcium: ((maxAllowed.calcium - cumulativeNutrients.calcium) * 100) / ingredient.calcium,
      };

      // Enforce minimum and maximum percentage limits
      const maxPossiblePercentage = Math.min(
        remainingPercentage,
        MAX_INGREDIENT_PERCENTAGE,
        ...Object.values(maxPercentages).filter(v => !isNaN(v) && v > 0)
      );

      // Skip if we can't meet minimum percentage requirement
      if (maxPossiblePercentage < MIN_INGREDIENT_PERCENTAGE) continue;

      // Adjust percentage based on remaining needs
      const totalDeficit = Object.values(deficits).reduce((sum, v) => sum + v, 0);
      const totalContribution = (
        (ingredient.pk * maxPossiblePercentage / 100) +
        (ingredient.lk * maxPossiblePercentage / 100) +
        (ingredient.sk * maxPossiblePercentage / 100) +
        (ingredient.tdn * maxPossiblePercentage / 100) +
        (ingredient.em * maxPossiblePercentage / 100) +
        (ingredient.calcium * maxPossiblePercentage / 100)
      );

      // Calculate optimal percentage while respecting minimum
      let adjustedPercentage = Math.max(
        MIN_INGREDIENT_PERCENTAGE,
        Math.min(
          maxPossiblePercentage,
          (maxPossiblePercentage * totalDeficit) / totalContribution
        )
      );

      // Round to 2 decimal places
      adjustedPercentage = Number(adjustedPercentage.toFixed(2));

      if (adjustedPercentage >= MIN_INGREDIENT_PERCENTAGE) {
        bestIngredient = ingredient;
        bestPercentage = adjustedPercentage;
        break;
      }
    }

    if (!bestIngredient || bestPercentage < MIN_INGREDIENT_PERCENTAGE) break;

    // Add ingredient to results
    const totalIngredientCost = (bestIngredient.pricePerKg * bestPercentage) / 100;

    // Update cumulative nutrients
    cumulativeNutrients.pk += (bestIngredient.pk * bestPercentage) / 100;
    cumulativeNutrients.lk += (bestIngredient.lk * bestPercentage) / 100;
    cumulativeNutrients.sk += (bestIngredient.sk * bestPercentage) / 100;
    cumulativeNutrients.tdn += (bestIngredient.tdn * bestPercentage) / 100;
    cumulativeNutrients.em += (bestIngredient.em * bestPercentage) / 100;
    cumulativeNutrients.calcium += (bestIngredient.calcium * bestPercentage) / 100;

    results.push({
      ingredient: bestIngredient.name,
      percentage: bestPercentage,
      costPerKg: bestIngredient.pricePerKg,
      totalCost: Number(totalIngredientCost.toFixed(2)),
    });

    remainingPercentage -= bestPercentage;
    totalCost += totalIngredientCost;
  }

  // Calculate final nutritional values
  const percentages = results.reduce(
    (acc, result) => {
      acc[result.ingredient] = result.percentage;
      return acc;
    },
    {} as Record<string, number>,
  );

  const nutritionalValues = calculateNutritionalValues(
    ingredients,
    percentages,
  );

  // Generate warnings for nutritional imbalances
  const warnings: string[] = [];
  for (const [nutrient, value] of Object.entries(nutritionalValues)) {
    const requirement = requirements[nutrient as keyof NutritionalRequirement];
    const minThreshold = MIN_NUTRIENT_THRESHOLDS[nutrient as keyof typeof MIN_NUTRIENT_THRESHOLDS];
    const maxThreshold = MAX_NUTRIENT_THRESHOLDS[nutrient as keyof typeof MAX_NUTRIENT_THRESHOLDS];

    if (value < requirement * minThreshold) {
      warnings.push(`${nutrient.toUpperCase()} terlalu rendah: ${value.toFixed(2)} (minimum: ${(requirement * minThreshold).toFixed(2)})`);
    } else if (value > requirement * maxThreshold) {
      warnings.push(`${nutrient.toUpperCase()} terlalu tinggi: ${value.toFixed(2)} (maksimal: ${(requirement * maxThreshold).toFixed(2)})`);
    }
  }

  return {
    results: results,
    totalCost: Number(totalCost.toFixed(2)),
    nutritionalValues,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};
