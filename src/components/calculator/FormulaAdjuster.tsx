import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { calculateNutritionalValues } from "@/lib/formulationLogic";

interface FormulaAdjusterProps {
  ingredients: any[];
  initialFormula: {
    ingredient: string;
    percentage: number;
    costPerKg: number;
    totalCost: number;
  }[];
  requirements: {
    pk: number;
    lk: number;
    sk: number;
    tdn: number;
    em: number;
    calcium: number;
  };
  onUpdate: (newFormula: any) => void;
}

const FormulaAdjuster: React.FC<FormulaAdjusterProps> = ({
  ingredients,
  initialFormula,
  requirements,
  onUpdate,
}) => {
  const [adjustedFormula, setAdjustedFormula] = useState(initialFormula);
  const [unusedIngredients, setUnusedIngredients] = useState(() => 
    ingredients.filter(ing => !initialFormula.some(f => f.ingredient === ing.name))
  );
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [newPercentage, setNewPercentage] = useState("");
  const [currentNutrients, setCurrentNutrients] = useState({
    pk: 0,
    lk: 0,
    sk: 0,
    tdn: 0,
    em: 0,
    calcium: 0,
  });

  // Update state when new initialFormula is received
  useEffect(() => {
    setAdjustedFormula(initialFormula);
    setUnusedIngredients(
      ingredients.filter(ing => !initialFormula.some(f => f.ingredient === ing.name))
    );
    setSelectedIngredient("");
    setNewPercentage("");
  }, [initialFormula, ingredients]);

  useEffect(() => {
    calculateCurrentNutrients();
  }, [adjustedFormula]);

  const calculateCurrentNutrients = () => {
    const percentages = adjustedFormula.reduce((acc, item) => {
      acc[item.ingredient] = item.percentage;
      return acc;
    }, {} as Record<string, number>);

    const nutrients = calculateNutritionalValues(ingredients, percentages);
    setCurrentNutrients(nutrients);
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !newPercentage) return;

    const ingredient = ingredients.find(ing => ing.name === selectedIngredient);
    if (!ingredient) return;

    const percentage = parseFloat(newPercentage);
    if (isNaN(percentage) || percentage <= 0) return;

    // Calculate total percentage including new addition
    const currentTotal = adjustedFormula.reduce((sum, item) => sum + item.percentage, 0);
    if (currentTotal + percentage > 100) {
      alert("Total persentase tidak boleh melebihi 100%");
      return;
    }

    const newFormula = [
      ...adjustedFormula,
      {
        ingredient: selectedIngredient,
        percentage,
        costPerKg: ingredient.pricePerKg,
        totalCost: (ingredient.pricePerKg * percentage) / 100,
      },
    ];

    setAdjustedFormula(newFormula);
    setUnusedIngredients(unusedIngredients.filter(ing => ing.name !== selectedIngredient));
    setSelectedIngredient("");
    setNewPercentage("");
    onUpdate(newFormula);
  };

  const handleUpdatePercentage = (index: number, newValue: string) => {
    const percentage = parseFloat(newValue);
    if (isNaN(percentage)) return;

    // Calculate total percentage excluding current item
    const otherTotal = adjustedFormula.reduce((sum, item, i) => 
      i === index ? sum : sum + item.percentage, 0
    );

    if (otherTotal + percentage > 100) {
      alert("Total persentase tidak boleh melebihi 100%");
      return;
    }

    const newFormula = adjustedFormula.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          percentage,
          totalCost: (item.costPerKg * percentage) / 100,
        };
      }
      return item;
    });

    setAdjustedFormula(newFormula);
    onUpdate(newFormula);
  };

  const handleRemoveIngredient = (index: number) => {
    const removedIngredient = ingredients.find(
      ing => ing.name === adjustedFormula[index].ingredient
    );
    if (removedIngredient) {
      setUnusedIngredients([...unusedIngredients, removedIngredient]);
    }

    const newFormula = adjustedFormula.filter((_, i) => i !== index);
    setAdjustedFormula(newFormula);
    onUpdate(newFormula);
  };

  const getNutrientStatus = (nutrient: keyof typeof currentNutrients) => {
    if (!requirements || !currentNutrients) return "text-gray-500";
    
    const value = currentNutrients[nutrient];
    const requirement = requirements[nutrient];
    
    if (!requirement) return "text-gray-500";
    
    const ratio = value / requirement;

    if (ratio < 0.85) return "text-red-500";
    if (ratio > 1.15) return "text-red-500";
    return "text-green-500";
  };

  return (
    <Card className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Penyesuaian Formula</h2>
        <div className="flex gap-4 mb-4">
          <select
            className="border p-2 rounded"
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
          >
            <option value="">Pilih Bahan</option>
            {unusedIngredients.map((ing) => (
              <option key={ing.id} value={ing.name}>
                {ing.name}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Persentase"
            value={newPercentage}
            onChange={(e) => setNewPercentage(e.target.value)}
            className="w-32"
          />
          <Button onClick={handleAddIngredient}>Tambah Bahan</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Formula Saat Ini</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bahan</TableHead>
                <TableHead>Persentase (%)</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustedFormula.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.ingredient}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.percentage}
                      onChange={(e) => handleUpdatePercentage(index, e.target.value)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveIngredient(index)}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Kandungan Nutrisi</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nutrisi</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>PK</TableCell>
                <TableCell className={getNutrientStatus("pk")}>
                  {currentNutrients.pk.toFixed(2)}%
                </TableCell>
                <TableCell>{requirements?.pk}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>LK</TableCell>
                <TableCell className={getNutrientStatus("lk")}>
                  {currentNutrients.lk.toFixed(2)}%
                </TableCell>
                <TableCell>{requirements?.lk}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SK</TableCell>
                <TableCell className={getNutrientStatus("sk")}>
                  {currentNutrients.sk.toFixed(2)}%
                </TableCell>
                <TableCell>{requirements?.sk}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TDN</TableCell>
                <TableCell className={getNutrientStatus("tdn")}>
                  {currentNutrients.tdn.toFixed(2)}%
                </TableCell>
                <TableCell>{requirements?.tdn}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>EM</TableCell>
                <TableCell className={getNutrientStatus("em")}>
                  {currentNutrients.em.toFixed(2)} Kkal/kg
                </TableCell>
                <TableCell>{requirements?.em} Kkal/kg</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Ca</TableCell>
                <TableCell className={getNutrientStatus("calcium")}>
                  {currentNutrients.calcium.toFixed(2)}%
                </TableCell>
                <TableCell>{requirements?.calcium}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};

export default FormulaAdjuster;
