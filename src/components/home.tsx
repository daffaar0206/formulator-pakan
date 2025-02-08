import React, { useState, useEffect } from "react";
import { nutritionalRequirements } from "@/lib/nutritionalRequirements";
import { Button } from "@/components/ui/button";
import AnimalSelectionPanel from "./calculator/AnimalSelectionPanel";
import IngredientManager from "./calculator/IngredientManager";
import NutritionalDisplay from "./calculator/NutritionalDisplay";
import FormulaResults from "./calculator/FormulaResults";
import { defaultIngredients } from "@/lib/defaultIngredients";
import { calculateFormulation } from "@/lib/formulationLogic";

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

  const [nutritionalValues, setNutritionalValues] = useState([]);
  const [formulaResults, setFormulaResults] = useState([]);
  const [totalFormulaCost, setTotalFormulaCost] = useState(0);

  useEffect(() => {
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
    localStorage.setItem("selectedAnimalType", selectedAnimalType);
    localStorage.setItem("selectedAgeGroup", selectedAgeGroup);
  }, [ingredients, selectedAnimalType, selectedAgeGroup]);

  useEffect(() => {
    const requirements =
      nutritionalRequirements[selectedAnimalType][selectedAgeGroup];
    setNutritionalValues([
      { name: "PK", current: 0, required: requirements.pk, unit: "%" },
      { name: "LK", current: 0, required: requirements.lk, unit: "%" },
      { name: "SK", current: 0, required: requirements.sk, unit: "%" },
      { name: "TDN", current: 0, required: requirements.tdn, unit: "%" },
      {
        name: "Calcium",
        current: 0,
        required: requirements.calcium,
        unit: "%",
      },
    ]);
  }, [selectedAnimalType, selectedAgeGroup]);

  const handleAddIngredient = (newIngredient) => {
    const id = Math.random().toString(36).substr(2, 9);
    setIngredients([...ingredients, { ...newIngredient, id }]);
  };

  const handleDeleteIngredient = (id) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleEditIngredient = (id, updatedIngredient) => {
    setIngredients(
      ingredients.map((ing) =>
        ing.id === id ? { ...updatedIngredient, id } : ing,
      ),
    );
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
              results={formulaResults}
              totalCost={totalFormulaCost}
              onReset={() => {
                localStorage.removeItem("ingredients");
                window.location.reload();
              }}
            />
            <NutritionalDisplay nutritionalValues={nutritionalValues} />
            <Button
              className="w-full mt-4"
              onClick={() => {
                const requirements =
                  nutritionalRequirements[selectedAnimalType][selectedAgeGroup];
                const { results, totalCost, nutritionalValues } =
                  calculateFormulation(ingredients, requirements);
                setFormulaResults(results);
                setTotalFormulaCost(totalCost);
                setNutritionalValues([
                  {
                    name: "PK",
                    current: nutritionalValues.pk,
                    required: requirements.pk,
                    unit: "%",
                  },
                  {
                    name: "LK",
                    current: nutritionalValues.lk,
                    required: requirements.lk,
                    unit: "%",
                  },
                  {
                    name: "SK",
                    current: nutritionalValues.sk,
                    required: requirements.sk,
                    unit: "%",
                  },
                  {
                    name: "TDN",
                    current: nutritionalValues.tdn,
                    required: requirements.tdn,
                    unit: "%",
                  },
                  {
                    name: "Calcium",
                    current: nutritionalValues.calcium,
                    required: requirements.calcium,
                    unit: "%",
                  },
                ]);
              }}
            >
              Mulai Formulasi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
