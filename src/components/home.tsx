import React, { useState, useEffect } from "react";
import { nutritionalRequirements, updateRequirements, addAnimalType } from "../lib/nutritionalRequirements"; 
import { Button } from "../components/ui/button"; 
import AnimalSelectionPanel from "./calculator/AnimalSelectionPanel";
import IngredientManager from "./calculator/IngredientManager";
import NutritionalDisplay from "./calculator/NutritionalDisplay";
import FormulaResults from "./calculator/FormulaResults";
import FormulaAdjuster from "./calculator/FormulaAdjuster";
import AnimalRequirementsManager from "./calculator/AnimalRequirementsManager";
import { defaultIngredients, availableIngredientsList } from "../lib/defaultIngredients"; 
import { calculateFormulation, calculateNutritionalValues, type Ingredient, type FormulaResult } from "../lib/formulationLogic"; 

// Rest of the component code remains the same
const Home = () => {
  const [selectedAnimalType, setSelectedAnimalType] = useState(() => {
    return localStorage.getItem("selectedAnimalType") || "dairy-cattle";
  });

  const [selectedAgeGroup, setSelectedAgeGroup] = useState(() => {
    return localStorage.getItem("selectedAgeGroup") || "calf";
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem("ingredients");
    return saved ? JSON.parse(saved) : [];
  });

  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem("availableIngredients");
    return saved ? JSON.parse(saved) : availableIngredientsList;
  });

  const [nutritionalValues, setNutritionalValues] = useState({
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  });

  const [formulaResults, setFormulaResults] = useState<FormulaResult[]>([]);
  const [totalFormulaCost, setTotalFormulaCost] = useState(0);
  const [showAdjuster, setShowAdjuster] = useState(false);
  const [adjustedFormula, setAdjustedFormula] = useState<FormulaResult[]>([]);
  const [formulationKey, setFormulationKey] = useState(0);

  useEffect(() => {
    localStorage.setItem("selectedAnimalType", selectedAnimalType);
    localStorage.setItem("selectedAgeGroup", selectedAgeGroup);
  }, [selectedAnimalType, selectedAgeGroup]);

  const handleAddAvailableIngredient = (ingredient: Ingredient) => {
    // Check if ingredient is already in the list
    if (ingredients.some(ing => ing.name === ingredient.name)) {
      return;
    }

    // Add to selected ingredients with original ID
    const newIngredients = [...ingredients, ingredient];
    setIngredients(newIngredients);
    localStorage.setItem("ingredients", JSON.stringify(newIngredients));

    // Remove from available ingredients
    const newAvailableIngredients = availableIngredients.filter(ing => ing.id !== ingredient.id);
    setAvailableIngredients(newAvailableIngredients);
    localStorage.setItem("availableIngredients", JSON.stringify(newAvailableIngredients));
  };

  const handleRemoveAvailableIngredient = (id: string) => {
    const newIngredients = ingredients.filter(ing => ing.id !== id);
    setIngredients(newIngredients);
    localStorage.setItem("ingredients", JSON.stringify(newIngredients));
  };

  const handleAddNewIngredient = (newIngredient: Ingredient) => {
    const id = Math.random().toString(36).substr(2, 9);
    const ingredientWithId = { ...newIngredient, id };
    const newAvailableIngredients = [...availableIngredients, ingredientWithId];
    const newIngredients = [...ingredients, ingredientWithId];
    setAvailableIngredients(newAvailableIngredients);
    setIngredients(newIngredients);
    localStorage.setItem("availableIngredients", JSON.stringify(newAvailableIngredients));
    localStorage.setItem("ingredients", JSON.stringify(newIngredients));
  };

  const handleDeleteIngredient = (id: string) => {
    const ingredientToDelete = ingredients.find(ing => ing.id === id);
    if (!ingredientToDelete) return;

    // Remove from selected ingredients
    const newIngredients = ingredients.filter(ing => ing.id !== id);
    setIngredients(newIngredients);
    localStorage.setItem("ingredients", JSON.stringify(newIngredients));

    // Find the original ingredient from availableIngredientsList
    const originalIngredient = availableIngredientsList.find(ing => ing.name === ingredientToDelete.name);
    if (originalIngredient) {
      // Add back to available ingredients with its original ID
      const newAvailableIngredients = [...availableIngredients, originalIngredient];
      setAvailableIngredients(newAvailableIngredients);
      localStorage.setItem("availableIngredients", JSON.stringify(newAvailableIngredients));
    }
  };

  const handleEditIngredient = (id: string, updatedIngredient: Ingredient) => {
    const newIngredients = ingredients.map((ing) =>
      ing.id === id ? { ...updatedIngredient, id } : ing,
    );
    setIngredients(newIngredients);
    localStorage.setItem("ingredients", JSON.stringify(newIngredients));
  };

  const handleUpdateRequirements = (pk: number, lk: number, sk: number, tdn: number, em: number, calcium: number) => {
    updateRequirements(selectedAnimalType, selectedAgeGroup, {
      pk, lk, sk, tdn, em, calcium
    });
    if (formulaResults.length > 0) {
      handleFormulation();
    }
  };

  const handleAddAnimalType = (type: string, ageGroup: string, requirements: any) => {
    addAnimalType({
      type,
      ageGroup,
      requirements
    });
    setSelectedAnimalType(type);
    setSelectedAgeGroup(ageGroup);
    setFormulaResults([]);
    setAdjustedFormula([]);
    setNutritionalValues({
      pk: 0,
      lk: 0,
      sk: 0,
      tdn: 0,
      em: 0,
      calcium: 0,
    });
    setTotalFormulaCost(0);
    setShowAdjuster(false);
  };

  const handleFormulation = () => {
    if (ingredients.length === 0) {
      return;
    }

    if (ingredients.length < 2) {
      return;
    }

    const requirements = nutritionalRequirements[selectedAnimalType][selectedAgeGroup];
    if (!requirements) {
      return;
    }

    const result = calculateFormulation(ingredients, requirements);
    
    console.log("Formulation Result:", result); // Log the result for debugging

    setShowAdjuster(false);
    setFormulaResults(result.results);
    setTotalFormulaCost(result.totalCost);
    setNutritionalValues(result.nutritionalValues);
    
    setFormulationKey(prev => prev + 1);
    setAdjustedFormula(result.results);
    
    setTimeout(() => {
      setShowAdjuster(true);
    }, 100);
  };

  const handleFormulaUpdate = (newFormula: FormulaResult[]) => {
    setAdjustedFormula(newFormula);
    
    const newTotalCost = newFormula.reduce((sum, item) => sum + item.totalCost, 0);
    setTotalFormulaCost(newTotalCost);

    const percentages = newFormula.reduce((acc, item) => {
      acc[item.ingredient] = item.percentage;
      return acc;
    }, {} as Record<string, number>);
    
    const newNutritionalValues = calculateNutritionalValues(ingredients, percentages);
    setNutritionalValues(newNutritionalValues);
  };

  const handleReset = () => {
    setFormulaResults([]);
    setAdjustedFormula([]);
    setNutritionalValues({
      pk: 0,
      lk: 0,
      sk: 0,
      tdn: 0,
      em: 0,
      calcium: 0,
    });
    setTotalFormulaCost(0);
    setShowAdjuster(false);
    setFormulationKey(0);
    setIngredients([]);
    setAvailableIngredients(availableIngredientsList);
    localStorage.removeItem("ingredients");
    localStorage.removeItem("availableIngredients");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight uppercase mb-2">
            PDP Formulator
          </h1>
          <p className="text-sm text-gray-500 italic">by: daffaar</p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mt-6">
            Kalkulator Formulasi Pakan
          </h2>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <AnimalSelectionPanel
            selectedAnimalType={selectedAnimalType}
            selectedAgeGroup={selectedAgeGroup}
            onAnimalTypeChange={setSelectedAnimalType}
            onAgeGroupChange={setSelectedAgeGroup}
          />

          <AnimalRequirementsManager
            selectedAnimalType={selectedAnimalType}
            selectedAgeGroup={selectedAgeGroup}
            onUpdateRequirements={handleUpdateRequirements}
            onAddAnimalType={handleAddAnimalType}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <IngredientManager
                ingredients={ingredients}
                availableIngredients={availableIngredients}
                onAddIngredient={handleAddNewIngredient}
                onDeleteIngredient={handleDeleteIngredient}
                onEditIngredient={handleEditIngredient}
                onAddAvailableIngredient={handleAddAvailableIngredient}
                onRemoveAvailableIngredient={handleRemoveAvailableIngredient}
              />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <FormulaResults
                results={adjustedFormula.length > 0 ? adjustedFormula : formulaResults}
                totalCost={totalFormulaCost}
                onReset={handleReset}
              />
              <NutritionalDisplay 
                nutritionalValues={nutritionalValues}
                requirements={nutritionalRequirements[selectedAnimalType][selectedAgeGroup]}
              />
              <Button
                className="w-full mt-4"
                onClick={handleFormulation}
                size="lg"
              >
                Mulai Formulasi
              </Button>
            </div>
          </div>

          {showAdjuster && (
            <div className="mt-4 sm:mt-6">
              <FormulaAdjuster
                key={formulationKey}
                ingredients={ingredients}
                initialFormula={adjustedFormula}
                requirements={nutritionalRequirements[selectedAnimalType][selectedAgeGroup]}
                onUpdate={handleFormulaUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
