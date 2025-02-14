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
  percentage?: number; // Temporary property
}

export interface NutritionalRequirement {
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  em: number;
  calcium: number;
}

export interface FormulationResult {
  results: FormulaResult[];
  totalCost: number;
  nutritionalValues: NutritionalRequirement;
  warnings?: string[];
}

export interface FormulaResult {
  ingredient: string;
  percentage: number;
  costPerKg: number;
  totalCost: number;
}

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

export interface IngredientScore {
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
  pk: 1.15,  // Max 115% of requirement
  lk: 1.20,  // Max 120% of requirement
  sk: 1.10,  // Max 110% of requirement
  tdn: 1.10, // Max 110% of requirement
  em: 1.10,  // Max 110% of requirement
  calcium: 1.20, // Max 120% of requirement
} as const;

// Define minimum thresholds as percentages of requirements
export const MIN_NUTRIENT_THRESHOLDS = {
  pk: 0.85,  // Min 85% of requirement
  lk: 0.80,  // Min 80% of requirement
  sk: 0.90,  // Min 90% of requirement
  tdn: 0.90, // Min 90% of requirement
  em: 0.90,  // Min 90% of requirement
  calcium: 0.80, // Min 80% of requirement
} as const;

export const calculateFormulation = (
  ingredients: Ingredient[],
  requirements: NutritionalRequirement
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

    // Calculate base optimal percentage from protein requirement
    let optimalPercentage = (requirements.pk / ing.pk) * 30;

    // Adjust based on nutrient ratios
    const nutrientBalance = (
      (Math.min(pkRatio, 1.2) * 0.4) + // 40% weight to protein
      (Math.min(tdnRatio, 1.2) * 0.3) + // 30% weight to energy
      (Math.min(emRatio, 1.2) * 0.2) + // 20% weight to metabolic energy
      (Math.min(calciumRatio, 1.2) * 0.1) // 10% weight to calcium
    );
    optimalPercentage *= nutrientBalance;

    // Adjust based on SK content
    if (skRatio > 1.2) {
      optimalPercentage *= 0.6; // Heavy reduction for very high SK
    } else if (skRatio > 1.1) {
      optimalPercentage *= 0.8; // Moderate reduction for high SK
    }

    // Further adjust based on cost
    const costFactor = Math.min(1, 10000 / ing.pricePerKg);
    optimalPercentage *= costFactor;

    // Ensure percentage is within reasonable bounds
    optimalPercentage = Math.min(Math.max(optimalPercentage, 5), 45);

    // Calculate base score from nutrient balance
    const nutrientScore = (
      (Math.min(pkRatio, 1.2) * 35) + // 35% weight to protein
      (Math.min(tdnRatio, 1.2) * 25) + // 25% weight to TDN
      (Math.min(emRatio, 1.2) * 20) + // 20% weight to metabolic energy
      (Math.min(lkRatio, 1.2) * 10) + // 10% weight to fat
      (Math.min(calciumRatio, 1.2) * 10) // 10% weight to calcium
    );

    // Apply SK penalty if too high
    const skPenalty = skRatio > 1.2 ? 0.6 : skRatio > 1.1 ? 0.8 : 1.0;
    
    // Calculate final score considering cost and SK
    const finalScore = (nutrientScore * skPenalty * 10000) / ing.pricePerKg;

    return {
      ingredient: ing,
      score: finalScore,
      optimalPercentage,
      ratios: { pkRatio, skRatio, tdnRatio, emRatio, lkRatio, calciumRatio }
    };
  });

  // Sort ingredients by score
  const sortedScores = [...ingredientScores].sort((a, b) => b.score - a.score);

  // First pass: Allocate percentages to top ingredients based on their optimal percentages
  for (const scored of sortedScores) {
    if (remainingPercentage < 2) break;
    if (results.length >= 8) break; // Maximum 8 ingredients

    // Calculate percentage based on optimal and remaining
    let percentage = Math.min(
      scored.optimalPercentage,
      remainingPercentage,
      40 // Hard cap at 40%
    );

    // Check nutrient limits
    const wouldExceedLimits = Object.entries(requirements).some(([nutrient, requirement]) => {
      const currentValue = cumulativeNutrients[nutrient as keyof NutritionalRequirement];
      const contribution = (scored.ingredient[nutrient as keyof Ingredient] as number * percentage) / 100;
      const maxAllowed = requirement * MAX_NUTRIENT_THRESHOLDS[nutrient as keyof typeof MAX_NUTRIENT_THRESHOLDS];
      return currentValue + contribution > maxAllowed;
    });

    if (wouldExceedLimits) {
      percentage = Math.max(2, percentage * 0.8); // Reduce but maintain minimum
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

  // If there's remaining percentage, distribute it based on nutrient needs
  if (remainingPercentage > 0 && results.length > 0) {
    // Calculate current nutrient levels vs requirements
    const currentLevels = {
      pk: cumulativeNutrients.pk / requirements.pk,
      tdn: cumulativeNutrients.tdn / requirements.tdn,
      em: cumulativeNutrients.em / requirements.em,
    };

    // Find the most deficient nutrient
    const deficits = Object.entries(currentLevels)
      .map(([nutrient, level]) => ({ nutrient, deficit: 1 - level }))
      .filter(({ deficit }) => deficit > 0)
      .sort((a, b) => b.deficit - a.deficit);

    if (deficits.length > 0) {
      // Find ingredients that can best address the deficits
      const targetNutrient = deficits[0].nutrient;
      const sortedByNutrient = [...results]
        .map(result => {
          const ingredient = ingredients.find(ing => ing.name === result.ingredient);
          if (!ingredient) return { result, ratio: 0 };
          const ratio = ingredient[targetNutrient as keyof Ingredient] as number / requirements[targetNutrient as keyof NutritionalRequirement];
          return { result, ratio };
        })
        .sort((a, b) => b.ratio - a.ratio);

      // Distribute remaining percentage to top contributors
      const topContributors = sortedByNutrient.slice(0, 2);
      const totalRatio = topContributors.reduce((sum, { ratio }) => sum + ratio, 0);
      
      topContributors.forEach(({ result, ratio }) => {
        const additionalPercentage = (remainingPercentage * ratio) / totalRatio;
        const newPercentage = Number((result.percentage + additionalPercentage).toFixed(2));
        const newCost = Number((result.costPerKg * newPercentage / 100).toFixed(2));
        result.percentage = newPercentage;
        result.totalCost = newCost;
      });
    } else {
      // If no deficits, distribute evenly among existing ingredients
      const perIngredient = remainingPercentage / results.length;
      results.forEach(result => {
        const newPercentage = Number((result.percentage + perIngredient).toFixed(2));
        const newCost = Number((result.costPerKg * newPercentage / 100).toFixed(2));
        result.percentage = newPercentage;
        result.totalCost = newCost;
      });
    }
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
