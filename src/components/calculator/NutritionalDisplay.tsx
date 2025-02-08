import React from "react";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface NutritionalValue {
  name: string;
  current: number;
  required: number;
  unit: string;
}

interface NutritionalDisplayProps {
  nutritionalValues?: NutritionalValue[];
}

const defaultNutritionalValues: NutritionalValue[] = [
  { name: "PK", current: 15, required: 20, unit: "%" },
  { name: "PK", current: 12, required: 18, unit: "%" },
  { name: "Calcium", current: 8, required: 10, unit: "g/kg" },
  { name: "LK", current: 5, required: 8, unit: "%" },
];

const NutritionalDisplay = ({
  nutritionalValues = defaultNutritionalValues,
}: NutritionalDisplayProps) => {
  return (
    <Card className="p-6 bg-white w-full">
      <h2 className="text-2xl font-semibold mb-4">Nutritional Balance</h2>
      <div className="space-y-6">
        {nutritionalValues.map((value) => {
          const percentage = (value.current / value.required) * 100;
          const isDeficient = percentage < 100;

          return (
            <TooltipProvider key={value.name}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{value.name}</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <span
                        className={`text-sm ${isDeficient ? "text-red-500" : "text-green-500"}`}
                      >
                        {value.current}
                        {value.unit} / {value.required}
                        {value.unit}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isDeficient ? "Deficient" : "Sufficient"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={
                    isDeficient ? "bg-red-500" : "bg-green-500"
                  }
                />
              </div>
            </TooltipProvider>
          );
        })}
      </div>
    </Card>
  );
};

export default NutritionalDisplay;
