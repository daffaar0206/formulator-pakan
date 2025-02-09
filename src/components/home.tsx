import React, { useState, useEffect } from "react";
import { nutritionalRequirements, updateRequirements, addAnimalType } from "@/lib/nutritionalRequirements";
import { Button } from "@/components/ui/button";
import AnimalSelectionPanel from "./calculator/AnimalSelectionPanel";
import IngredientManager from "./calculator/IngredientManager";
import NutritionalDisplay from "./calculator/NutritionalDisplay";
import FormulaResults from "./calculator/FormulaResults";
import FormulaAdjuster from "./calculator/FormulaAdjuster";
import AnimalRequirementsManager from "./calculator/AnimalRequirementsManager";
import { defaultIngredients } from "@/lib/defaultIngredients";
import { calculateFormulation, calculateNutritionalValues } from "@/lib/formulationLogic";
import type { FormulaResult } from "@/lib/formulationLogic";

const Home = () => {
  const [selectedAnimalType, setSelectedAnimalType] = useState(() => {
    return localStorage.getItem("selectedAnimalType") || "dairy-cattle";
  });
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(() => {
    return localStorage.getItem("selectedAgeGroup") || "calf";
  });
  const [ingredients, setIngredients] = useState(() => {
    const saved = localStorage.getItem("ingredients");
    return saved ? JSON.parse(saved) : defaultIngredients;
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

  // Listen for requirements updates
  useEffect(() => {
    const handleRequirementsUpdate = () => {
      // Get available animal types
      const availableTypes = Object.keys(nutritionalRequirements);
      
      // If current type no longer exists, switch to first available
      if (!availableTypes.includes(selectedAnimalType) && availableTypes.length > 0) {
        const newType = availableTypes[0];
        setSelectedAnimalType(newType);
        
        // Get available age groups for new type
        const newAgeGroups = Object.keys(nutritionalRequirements[newType]);
        if (newAgeGroups.length > 0) {
          setSelectedAgeGroup(newAgeGroups[0]);
        }

        // Reset formula when switching types
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
      } else {
        // If current age group no longer exists, switch to first available
        const currentAgeGroups = Object.keys(nutritionalRequirements[selectedAnimalType] || {});
        if (!currentAgeGroups.includes(selectedAgeGroup) && currentAgeGroups.length > 0) {
          setSelectedAgeGroup(currentAgeGroups[0]);
          
          // Reset formula when switching age groups
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
        }
      }
    };

    window.addEventListener('requirementsUpdated', handleRequirementsUpdate);
    return () => {
      window.removeEventListener('requirementsUpdated', handleRequirementsUpdate);
    };
  }, [selectedAnimalType, selectedAgeGroup]);

  useEffect(() => {
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
    localStorage.setItem("selectedAnimalType", selectedAnimalType);
    localStorage.setItem("selectedAgeGroup", selectedAgeGroup);
  }, [ingredients, selectedAnimalType, selectedAgeGroup]);

  const handleAddIngredient = (newIngredient: any) => {
    const id = Math.random().toString(36).substr(2, 9);
    setIngredients([...ingredients, { ...newIngredient, id }]);
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleEditIngredient = (id: string, updatedIngredient: any) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...updatedIngredient, id } : ing,
      ),
    );
  };

  const handleUpdateRequirements = (pk: number, lk: number, sk: number, tdn: number, em: number, calcium: number) => {
    updateRequirements(selectedAnimalType, selectedAgeGroup, {
      pk, lk, sk, tdn, em, calcium
    });
    // Recalculate formula if it exists
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
    
    // Switch to new animal type
    setSelectedAnimalType(type);
    setSelectedAgeGroup(ageGroup);
    
    // Reset formula
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
    const requirements = nutritionalRequirements[selectedAnimalType][selectedAgeGroup];
    const result = calculateFormulation(ingredients, requirements);
    
    // Reset formula adjuster state
    setShowAdjuster(false);
    
    // Update results
    setFormulaResults(result.results);
    setTotalFormulaCost(result.totalCost);
    setNutritionalValues(result.nutritionalValues);
    
    // Force FormulaAdjuster to re-render with new data
    setFormulationKey(prev => prev + 1);
    setAdjustedFormula(result.results);
    
    // Show adjuster after a brief delay to ensure clean re-render
    setTimeout(() => {
      setShowAdjuster(true);
    }, 100);
  };

  const handleFormulaUpdate = (newFormula: FormulaResult[]) => {
    setAdjustedFormula(newFormula);
    
    // Calculate new total cost
    const newTotalCost = newFormula.reduce((sum, item) => sum + item.totalCost, 0);
    setTotalFormulaCost(newTotalCost);

    // Update nutritional values based on the adjusted formula
    const percentages = newFormula.reduce((acc, item) => {
      acc[item.ingredient] = item.percentage;
      return acc;
    }, {} as Record<string, number>);
    
    const newNutritionalValues = calculateNutritionalValues(ingredients, percentages);
    setNutritionalValues(newNutritionalValues);
  };

  const handleReset = () => {
    localStorage.removeItem("ingredients");
    setIngredients(defaultIngredients);
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Kalkulator Formulasi Pakan
        </h1>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <IngredientManager
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onEditIngredient={handleEditIngredient}
            />
          </div>
          <div className="space-y-6">
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
            >
              Mulai Formulasi
            </Button>
          </div>
        </div>

        {showAdjuster && (
          <FormulaAdjuster
            key={formulationKey}
            ingredients={ingredients}
            initialFormula={adjustedFormula}
            requirements={nutritionalRequirements[selectedAnimalType][selectedAgeGroup]}
            onUpdate={handleFormulaUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
