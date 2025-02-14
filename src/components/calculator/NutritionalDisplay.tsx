import React from "react";
import { cn } from "../../lib/utils";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface NutritionalDisplayProps {
  nutritionalValues: {
    pk: number;
    lk: number;
    sk: number;
    tdn: number;
    em: number;
    calcium: number;
  };
  requirements: {
    pk: number;
    lk: number;
    sk: number;
    tdn: number;
    em: number;
    calcium: number;
  };
}

const NutritionalDisplay: React.FC<NutritionalDisplayProps> = ({
  nutritionalValues,
  requirements,
}) => {
  // Ensure we have valid numbers for all values
  const safeValues = {
    pk: Number(nutritionalValues?.pk) || 0,
    lk: Number(nutritionalValues?.lk) || 0,
    sk: Number(nutritionalValues?.sk) || 0,
    tdn: Number(nutritionalValues?.tdn) || 0,
    em: Number(nutritionalValues?.em) || 0,
    calcium: Number(nutritionalValues?.calcium) || 0,
  };

  const safeRequirements = {
    pk: Number(requirements?.pk) || 1,
    lk: Number(requirements?.lk) || 1,
    sk: Number(requirements?.sk) || 1,
    tdn: Number(requirements?.tdn) || 1,
    em: Number(requirements?.em) || 1,
    calcium: Number(requirements?.calcium) || 1,
  };

  const displayValues = [
    { name: "PK", current: safeValues.pk, required: safeRequirements.pk, unit: "%" },
    { name: "LK", current: safeValues.lk, required: safeRequirements.lk, unit: "%" },
    { name: "SK", current: safeValues.sk, required: safeRequirements.sk, unit: "%" },
    { name: "TDN", current: safeValues.tdn, required: safeRequirements.tdn, unit: "%" },
    { name: "EM", current: safeValues.em, required: safeRequirements.em, unit: "Kkal/kg" },
    { name: "Ca", current: safeValues.calcium, required: safeRequirements.calcium, unit: "%" },
  ];

  return (
    <Card className="p-6 bg-white w-full">
      <h2 className="text-2xl font-semibold mb-4">Nutritional Balance</h2>
      <div className="space-y-6">
        {displayValues.map((value) => {
          // Calculate percentage safely
          const percentage = value.required > 0 
            ? (value.current / value.required) * 100 
            : 0;

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
                        {value.current.toFixed(2)}
                        {value.unit} / {value.required.toFixed(2)}
                        {value.unit}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isDeficient ? "Deficient" : "Sufficient"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Progress
                  value={Math.min(100, Math.max(0, percentage))}
                  className={cn(
                    "h-2",
                    isDeficient ? "bg-red-500" : "bg-green-500"
                  )}
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
