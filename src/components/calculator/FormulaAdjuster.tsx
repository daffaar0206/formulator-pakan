import { Ingredient } from '../../lib/types';
import React, { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Progress } from "../ui/progress";
import { cn } from "../../lib/utils";

interface FormulaResult {
  ingredient: string;  // This is the ingredient name
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

  useEffect(() => {
    setLocalFormula(initialFormula);
  }, [initialFormula]);

  useEffect(() => {
    const newTotal = localFormula.reduce((sum, item) => sum + item.percentage, 0);
    setTotal(newTotal);
  }, [localFormula]);

  const handleAdjust = (percentage: number, ingredientName: string) => {
    // Find if ingredient already exists in formula
    const existingIndex = localFormula.findIndex(item => item.ingredient === ingredientName);
    const ingredient = ingredients.find(ing => ing.name === ingredientName);
    const costPerKg = ingredient?.pricePerKg || 0;
    const newCost = (percentage * costPerKg) / 100;

    let newFormula: FormulaResult[];
    
    if (existingIndex >= 0) {
      // Update existing ingredient
      newFormula = localFormula.map((item, index) => {
        if (index === existingIndex) {
          return {
            ...item,
            percentage,
            totalCost: Number(newCost.toFixed(2))
          };
        }
        return item;
      });
    } else {
      // Add new ingredient
      newFormula = [
        ...localFormula,
        {
          ingredient: ingredientName,
          percentage,
          costPerKg,
          totalCost: Number(newCost.toFixed(2))
        }
      ];
    }

    setLocalFormula(newFormula);
    onUpdate(newFormula);
  };

  const handleRemoveIngredient = (ingredientName: string) => {
    const newFormula = localFormula.filter(item => item.ingredient !== ingredientName);
    setLocalFormula(newFormula);
    onUpdate(newFormula);
  };

  const handleReset = () => {
    setLocalFormula(initialFormula);
    onUpdate(initialFormula);
  };

  const totalCost = localFormula.reduce((sum, item) => sum + item.totalCost, 0);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">Adjust Formula</h3>
            <p className="text-sm text-gray-500 mt-1">Adjust percentages to optimize your formula</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Total: <span className={total === 100 ? "text-green-600" : "text-red-600"}>{total.toFixed(1)}%</span>
            </div>
            <div className="text-sm text-gray-500">
              Total Cost: Rp {totalCost.toLocaleString()}
            </div>
          </div>
        </div>

        <Progress 
          value={total} 
          className={cn(
            "h-2",
            total > 100 ? "bg-red-100" : "bg-gray-100"
          )}
        />
        
        <div className="grid gap-4">
          {ingredients.map((ingredient) => {
            const formula = localFormula.find(f => f.ingredient === ingredient.name);
            
            return (
              <div key={ingredient.id} className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {ingredient.name}
                  </label>
                  <div className="text-xs text-gray-500 mt-1">
                    PK: {ingredient.pk}% | SK: {ingredient.sk}% | TDN: {ingredient.tdn}%
                  </div>
                </div>
                
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formula?.percentage || 0}
                      onChange={(e) => handleAdjust(Number(e.target.value), ingredient.name)}
                      className="w-24"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>

                <div className="col-span-5 text-right">
                  <div className="text-sm text-gray-700">
                    Rp {ingredient.pricePerKg.toLocaleString()}/kg
                  </div>
                  <div className="text-sm font-medium">
                    Total: Rp {formula?.totalCost.toLocaleString() || '0'}
                  </div>
                  {formula && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveIngredient(ingredient.name)}
                      className="mt-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-6">
          <Button 
            onClick={handleReset}
            variant="outline"
          >
            Reset to Original
          </Button>
          <Button 
            onClick={() => onUpdate(localFormula)}
            disabled={total !== 100}
            variant={total === 100 ? "default" : "secondary"}
          >
            {total === 100 ? "Apply Changes" : `Adjust to 100% (Current: ${total.toFixed(1)}%)`}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FormulaAdjuster;
