interface Ingredient {
  id: string;
  name: string;
  bk: number;
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  calcium: number;
  pricePerKg: number;
}

interface NutritionalRequirement {
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  calcium: number;
}

interface FormulaResult {
  ingredient: string;
  percentage: number;
  costPerKg: number;
  totalCost: number;
}

const calculateNutritionalValues = (
  ingredients: Ingredient[],
  percentages: Record<string, number>,
) => {
  const totals = {
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    calcium: 0,
  };

  ingredients.forEach((ingredient) => {
    const percentage = percentages[ingredient.name] || 0;
    totals.pk += (ingredient.pk * percentage) / 100;
    totals.lk += (ingredient.lk * percentage) / 100;
    totals.sk += (ingredient.sk * percentage) / 100;
    totals.tdn += (ingredient.tdn * percentage) / 100;
    totals.calcium += (ingredient.calcium * percentage) / 100;
  });

  return totals;
};

export const calculateFormulation = (
  ingredients: Ingredient[],
  requirements: NutritionalRequirement,
): {
  results: FormulaResult[];
  totalCost: number;
  nutritionalValues: NutritionalRequirement;
} => {
  // Implementasi algoritma sederhana untuk formulasi pakan
  let remainingPercentage = 100;
  let results: FormulaResult[] = [];
  let totalCost = 0;

  // Calculate nutrient efficiency scores
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const scoreA =
      (a.pk / requirements.pk + a.tdn / requirements.tdn) / a.pricePerKg;
    const scoreB =
      (b.pk / requirements.pk + b.tdn / requirements.tdn) / b.pricePerKg;
    return scoreB - scoreA;
  });

  // Alokasikan persentase untuk setiap bahan
  sortedIngredients.forEach((ingredient) => {
    if (remainingPercentage <= 0) return;

    // Calculate optimal percentage based on multiple nutrients
    const pkPercent = (requirements.pk * 100) / ingredient.pk;
    const tdnPercent = (requirements.tdn * 100) / ingredient.tdn;
    const skPercent = (requirements.sk * 100) / ingredient.sk;

    let percentage = Math.min(
      remainingPercentage,
      Math.min(pkPercent, Math.min(tdnPercent, skPercent)),
    );

    // Batasi persentase maksimum per bahan (40%)
    percentage = Math.min(percentage, 40);

    // Pastikan total tidak melebihi 100%
    percentage = Math.min(percentage, remainingPercentage);

    if (percentage > 0) {
      const costPerKg = ingredient.pricePerKg;
      const totalIngredientCost = (costPerKg * percentage) / 100;

      results.push({
        ingredient: ingredient.name,
        percentage: Number(percentage.toFixed(2)),
        costPerKg: costPerKg,
        totalCost: Number(totalIngredientCost.toFixed(2)),
      });

      remainingPercentage -= percentage;
      totalCost += totalIngredientCost;
    }
  });

  // Jika masih ada sisa persentase, distribusikan ke bahan termurah
  if (remainingPercentage > 0) {
    const cheapestIngredient = ingredients.reduce((prev, curr) =>
      prev.pricePerKg < curr.pricePerKg ? prev : curr,
    );

    results.push({
      ingredient: cheapestIngredient.name,
      percentage: Number(remainingPercentage.toFixed(2)),
      costPerKg: cheapestIngredient.pricePerKg,
      totalCost: Number(
        ((cheapestIngredient.pricePerKg * remainingPercentage) / 100).toFixed(
          2,
        ),
      ),
    });

    totalCost += (cheapestIngredient.pricePerKg * remainingPercentage) / 100;
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

  return {
    results: results,
    totalCost: Number(totalCost.toFixed(2)),
    nutritionalValues,
  };
};
