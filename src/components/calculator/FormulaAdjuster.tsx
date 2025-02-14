import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { cn } from "../../lib/utils";
import { Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { availableIngredientsList } from "../../lib/defaultIngredients";
import { calculateNutritionalValues } from "../../lib/formulationLogic";
import { Ingredient } from "../../lib/types";

interface FormulaResult {
  ingredient: string;
  percentage: number;
  costPerKg: number;
  totalCost: number;
}

interface NutritionalRequirement {
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  em: number;
  calcium: number;
}

interface FormulaAdjusterProps {
  ingredients: Ingredient[];
  initialFormula: FormulaResult[];
  onUpdate: (newFormula: FormulaResult[]) => void;
  requirements?: NutritionalRequirement;
}

const FormulaAdjuster: React.FC<FormulaAdjusterProps> = ({ ingredients, initialFormula, onUpdate, requirements }) => {
  const [localFormula, setLocalFormula] = useState<FormulaResult[]>(initialFormula);
  const [total, setTotal] = useState(100);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const availableToAdd = availableIngredientsList.filter(ing => 
    !localFormula.some(f => f.ingredient === ing.name) &&
    ing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (initialFormula.length === 0 && ingredients.length > 0) {
      const newFormula = ingredients.map(ing => ({
        ingredient: ing.name,
        percentage: 0,
        costPerKg: ing.pricePerKg,
        totalCost: 0
      }));
      setLocalFormula(newFormula);
    } else {
      setLocalFormula(initialFormula);
    }
  }, [initialFormula, ingredients]);

  useEffect(() => {
    const newTotal = localFormula.reduce((sum, item) => sum + item.percentage, 0);
    setTotal(newTotal);

    if (requirements) {
      const percentages = localFormula.reduce((acc, item) => {
        acc[item.ingredient] = item.percentage;
        return acc;
      }, {} as Record<string, number>);

      const nutritionalValues = calculateNutritionalValues(ingredients, percentages);
      const newWarnings: string[] = [];

      Object.entries(nutritionalValues).forEach(([nutrient, value]) => {
        const requirement = requirements[nutrient as keyof NutritionalRequirement];
        if (requirement && typeof value === 'number') {
          if (value < requirement * 0.9) {
            newWarnings.push(`${nutrient.toUpperCase()} terlalu rendah`);
          } else if (value > requirement * 1.1) {
            newWarnings.push(`${nutrient.toUpperCase()} terlalu tinggi`);
          }
        }
      });

      setWarnings(newWarnings);
    }
  }, [localFormula, ingredients, requirements]);

  const handleAddIngredient = (ingredient: Ingredient) => {
    const newFormulaItem: FormulaResult = {
      ingredient: ingredient.name,
      percentage: 0,
      costPerKg: ingredient.pricePerKg,
      totalCost: 0
    };

    setLocalFormula([...localFormula, newFormulaItem]);
    setShowAddDialog(false);
    setSearchTerm("");
  };

  const handleRemoveIngredient = (ingredientName: string) => {
    const newFormula = localFormula.filter(item => item.ingredient !== ingredientName);
    setLocalFormula(newFormula);
  };

  const handleAdjust = (percentage: number, ingredientName: string) => {
    const ingredient = ingredients.find(ing => ing.name === ingredientName) || 
                      availableIngredientsList.find(ing => ing.name === ingredientName);
    if (!ingredient) return;

    const newFormula = localFormula.map(item => {
      if (item.ingredient === ingredientName) {
        const newCost = (percentage * ingredient.pricePerKg) / 100;
        return { 
          ...item, 
          percentage,
          totalCost: Number(newCost.toFixed(2))
        };
      }
      return item;
    });

    setLocalFormula(newFormula);
  };

  const handleApplyChanges = () => {
    if (total === 100) {
      onUpdate(localFormula);
    }
  };

  const handleReset = () => {
    setLocalFormula(initialFormula);
    onUpdate(initialFormula);
  };

  const totalCost = localFormula.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <Card className="p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold">Adjust Formula</h3>
            <p className="text-sm text-gray-500 mt-1">Adjust percentages to optimize your formula</p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full sm:w-auto">
            <div className="text-right w-full sm:w-auto">
              <div className="text-sm font-medium">
                Total: <span className={total === 100 ? "text-green-600" : "text-red-600"}>{total.toFixed(1)}%</span>
              </div>
              <div className="text-sm text-gray-500">
                Total Cost: Rp {totalCost.toLocaleString()}
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Bahan
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-3xl p-0 bg-white" aria-describedby="ingredient-search-description">
                <div className="flex justify-between items-center px-4 py-2 border-b sticky top-0 bg-white z-10">
                  <DialogTitle className="text-lg">Pilih Bahan</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddDialog(false)}
                    className="h-8 w-8 p-0"
                    aria-label="Tutup"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p id="ingredient-search-description" className="sr-only">
                  Cari dan pilih bahan untuk ditambahkan ke formula
                </p>
                <div className="p-4 border-b sticky top-[49px] bg-white z-10">
                  <Input
                    placeholder="Cari bahan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="overflow-x-auto">
                  <div className="p-4">
                    <div className="min-w-[1000px] border rounded-lg bg-white">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium">Bahan</th>
                            <th className="px-4 py-3 text-right font-medium">BK (%)</th>
                            <th className="px-4 py-3 text-right font-medium">PK (%)</th>
                            <th className="px-4 py-3 text-right font-medium">LK (%)</th>
                            <th className="px-4 py-3 text-right font-medium">SK (%)</th>
                            <th className="px-4 py-3 text-right font-medium">TDN (%)</th>
                            <th className="px-4 py-3 text-right font-medium">EM (kkal)</th>
                            <th className="px-4 py-3 text-right font-medium">Ca (%)</th>
                            <th className="px-4 py-3 text-right font-medium">Harga/kg</th>
                            <th className="px-4 py-3 text-center font-medium">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {availableToAdd.map((ingredient) => (
                            <tr key={ingredient.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-left font-medium">{ingredient.name}</td>
                              <td className="px-4 py-3 text-right">{ingredient.bk}%</td>
                              <td className="px-4 py-3 text-right">{ingredient.pk}%</td>
                              <td className="px-4 py-3 text-right">{ingredient.lk}%</td>
                              <td className="px-4 py-3 text-right">{ingredient.sk}%</td>
                              <td className="px-4 py-3 text-right">{ingredient.tdn}%</td>
                              <td className="px-4 py-3 text-right">{ingredient.em}</td>
                              <td className="px-4 py-3 text-right">{ingredient.calcium}%</td>
                              <td className="px-4 py-3 text-right">Rp {ingredient.pricePerKg.toLocaleString()}</td>
                              <td className="px-4 py-3 text-center">
                                <Button
                                  size="sm"
                                  onClick={() => handleAddIngredient(ingredient)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Progress 
          value={total} 
          className={cn(
            "h-2",
            total > 100 ? "bg-red-100" : "bg-gray-100"
          )}
        />

        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm font-medium text-yellow-800">Warnings:</p>
            <ul className="mt-1 text-sm text-yellow-700">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="space-y-2">
          {localFormula.map((formula) => {
            const ingredient = ingredients.find(ing => ing.name === formula.ingredient) ||
                             availableIngredientsList.find(ing => ing.name === formula.ingredient);
            if (!ingredient) return null;
            
            return (
              <div key={ingredient.id} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium">{ingredient.name}</h4>
                    <p className="text-sm text-gray-500">Rp {ingredient.pricePerKg.toLocaleString()}/kg</p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-initial">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formula.percentage}
                        onChange={(e) => handleAdjust(Number(e.target.value), formula.ingredient)}
                        className="w-full sm:w-24"
                      />
                    </div>
                    <span className="text-gray-500">%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIngredient(formula.ingredient)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <div>PK: {ingredient.pk}%</div>
                    <div>SK: {ingredient.sk}%</div>
                    <div>TDN: {ingredient.tdn}%</div>
                    <div>EM: {ingredient.em}</div>
                    <div>Ca: {ingredient.calcium}%</div>
                    <div>Total: Rp {formula.totalCost.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
          <Button 
            onClick={handleReset}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Reset to Original
          </Button>
          <Button 
            onClick={handleApplyChanges}
            disabled={total !== 100}
            variant={total === 100 ? "default" : "secondary"}
            className="w-full sm:w-auto"
          >
            {total === 100 ? "Apply Changes" : `Adjust to 100% (Current: ${total.toFixed(1)}%)`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormulaAdjuster;
