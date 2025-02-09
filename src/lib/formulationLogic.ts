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

interface IngredientScore {
  ingredient: Ingredient;
  score: number;
  optimalPercentage: number;
  ratios: {
    pkRatio: number;
    skRatio: number;
    tdnRatio: number;
    emRatio: number;
    lkRatio: number;
    calciumRatio: number;
  };
}

// Define maximum thresholds as percentages of requirements
export const MAX_NUTRIENT_THRESHOLDS = {
  pk: 1.03,  // Max 103% of requirement (tighter control)
  lk: 1.10,  // Max 110% of requirement
  sk: 1.02,  // Max 102% of requirement (very strict SK limit)
  tdn: 1.05, // Max 105% of requirement
  em: 1.05,  // Max 105% of requirement
  calcium: 1.10, // Max 110% of requirement
} as const;

// Define minimum thresholds as percentages of requirements
export const MIN_NUTRIENT_THRESHOLDS = {
  pk: 0.97,  // Min 97% of requirement
  lk: 0.90,  // Min 90% of requirement
  sk: 0.98,  // Min 98% of requirement (tight SK range)
  tdn: 0.95, // Min 95% of requirement
  em: 0.95,  // Min 95% of requirement
  calcium: 0.90, // Min 90% of requirement
} as const;

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
  let remainingPercentage = 100;
  let results: FormulaResult[] = [];
  let totalCost = 0;
  
  let cumulativeNutrients: NutritionalRequirement = {
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  };

  // Calculate base scores and optimal percentages for each ingredient
  const ingredientScores: IngredientScore[] = ingredients.map(ing => {
    // Calculate nutrient ratios
    const pkRatio = ing.pk / requirements.pk;
    const skRatio = ing.sk / requirements.sk;
    const tdnRatio = ing.tdn / requirements.tdn;
    const emRatio = ing.em / requirements.em;
    const lkRatio = ing.lk / requirements.lk;
    const calciumRatio = ing.calcium / requirements.calcium;

    // Calculate optimal percentage based on nutrient contribution
    let optimalPercentage = (requirements.pk / ing.pk) * 15; // Start with PK-based percentage
    
    // Adjust based on SK content
    if (skRatio > 1.2) {
      optimalPercentage *= 0.4; // Heavy reduction for very high SK
    } else if (skRatio > 1.1) {
      optimalPercentage *= 0.6; // Moderate reduction for high SK
    }

    // Further adjust based on cost and other nutrients
    const costFactor = Math.min(1, 5000 / ing.pricePerKg); // Reduce percentage for expensive ingredients
    optimalPercentage *= costFactor;

    // Ensure percentage is within reasonable bounds
    optimalPercentage = Math.min(Math.max(optimalPercentage, 5), 20);

    // Calculate score based on nutrient balance and cost
    const nutrientScore = (
      (Math.min(pkRatio, 1.1) * 35) + // Highest weight to PK
      (Math.min(tdnRatio, 1.1) * 25) + // High weight to TDN
      (Math.min(emRatio, 1.1) * 20) + // Good weight to EM
      (Math.min(skRatio, 1.0) * 10) + // Lower weight to SK, cap at 100%
      (Math.min(lkRatio, 1.1) * 5) +
      (Math.min(calciumRatio, 1.1) * 5)
    ) / ing.pricePerKg; // Consider cost efficiency

    return {
      ingredient: ing,
      score: nutrientScore,
      optimalPercentage,
      ratios: { pkRatio, skRatio, tdnRatio, emRatio, lkRatio, calciumRatio }
    };
  });

  // Sort ingredients by score
  const sortedScores = [...ingredientScores].sort((a, b) => b.score - a.score);

  // First pass: Allocate percentages to top ingredients based on their optimal percentages
  for (const scored of sortedScores) {
    if (remainingPercentage < 5) break;
    if (results.length >= 8) break; // Maximum 8 ingredients

    // Calculate percentage based on optimal and remaining
    let percentage = Math.min(
      scored.optimalPercentage,
      remainingPercentage,
      20 // Hard cap at 20%
    );

    // Check nutrient limits
    const wouldExceedLimits = Object.entries(requirements).some(([nutrient, requirement]) => {
      const currentValue = cumulativeNutrients[nutrient as keyof NutritionalRequirement];
      const contribution = (scored.ingredient[nutrient as keyof Ingredient] as number * percentage) / 100;
      const maxAllowed = requirement * MAX_NUTRIENT_THRESHOLDS[nutrient as keyof typeof MAX_NUTRIENT_THRESHOLDS];
      return currentValue + contribution > maxAllowed;
    });

    if (wouldExceedLimits) {
      percentage = Math.max(5, percentage * 0.6); // Reduce but maintain minimum
    }

    const totalIngredientCost = (scored.ingredient.pricePerKg * percentage) / 100;

    // Update cumulative nutrients
    cumulativeNutrients.pk += (scored.ingredient.pk * percentage) / 100;
    cumulativeNutrients.lk += (scored.ingredient.lk * percentage) / 100;
    cumulativeNutrients.sk += (scored.ingredient.sk * percentage) / 100;
    cumulativeNutrients.tdn += (scored.ingredient.tdn * percentage) / 100;
    cumulativeNutrients.em += (scored.ingredient.em * percentage) / 100;
    cumulativeNutrients.calcium += (scored.ingredient.calcium * percentage) / 100;

    results.push({
      ingredient: scored.ingredient.name,
      percentage: Number(percentage.toFixed(2)),
      costPerKg: scored.ingredient.pricePerKg,
      totalCost: Number(totalIngredientCost.toFixed(2)),
    });

    remainingPercentage -= percentage;
    totalCost += totalIngredientCost;
  }

  // If there's remaining percentage, distribute it proportionally based on scores
  if (remainingPercentage > 0 && results.length > 0) {
    const totalScore = results.reduce((sum, result) => {
      const score = sortedScores.find(s => s.ingredient.name === result.ingredient)?.score || 0;
      return sum + score;
    }, 0);

    results.forEach(result => {
      const score = sortedScores.find(s => s.ingredient.name === result.ingredient)?.score || 0;
      const additionalPercentage = (remainingPercentage * score) / totalScore;
      const newPercentage = Number((result.percentage + additionalPercentage).toFixed(2));
      const newCost = Number((result.costPerKg * newPercentage / 100).toFixed(2));
      result.percentage = newPercentage;
      result.totalCost = newCost;
    });
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
