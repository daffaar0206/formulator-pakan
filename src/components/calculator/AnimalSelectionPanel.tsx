import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";

interface AnimalSelectionPanelProps {
  onAnimalTypeChange?: (value: string) => void;
  onAgeGroupChange?: (value: string) => void;
  selectedAnimalType?: string;
  selectedAgeGroup?: string;
}

const animalTypes = [
  { value: "dairy-cattle", label: "Dairy Cattle" },
  { value: "beef-cattle", label: "Beef Cattle" },
  { value: "broiler-chicken", label: "Broiler Chicken" },
  { value: "layer-chicken", label: "Layer Chicken" },
];

const ageGroups = {
  "dairy-cattle": [
    { value: "calf", label: "Calf (0-6 months)" },
    { value: "heifer", label: "Heifer (6-24 months)" },
    { value: "adult", label: "Adult (>24 months)" },
  ],
  "beef-cattle": [
    { value: "calf", label: "Calf (0-8 months)" },
    { value: "yearling", label: "Yearling (8-20 months)" },
    { value: "adult", label: "Adult (>20 months)" },
  ],
  "broiler-chicken": [
    { value: "starter", label: "Starter (0-3 weeks)" },
    { value: "grower", label: "Grower (3-6 weeks)" },
    { value: "finisher", label: "Finisher (6-8 weeks)" },
  ],
  "layer-chicken": [
    { value: "chick", label: "Chick (0-8 weeks)" },
    { value: "pullet", label: "Pullet (8-20 weeks)" },
    { value: "layer", label: "Layer (>20 weeks)" },
  ],
};

const AnimalSelectionPanel: React.FC<AnimalSelectionPanelProps> = ({
  onAnimalTypeChange = () => {},
  onAgeGroupChange = () => {},
  selectedAnimalType = "dairy-cattle",
  selectedAgeGroup = "calf",
}) => {
  const currentAgeGroups =
    ageGroups[selectedAnimalType as keyof typeof ageGroups] ||
    ageGroups["dairy-cattle"];

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Animal Type
          </label>
          <Select value={selectedAnimalType} onValueChange={onAnimalTypeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select animal type" />
            </SelectTrigger>
            <SelectContent>
              {animalTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age Group
          </label>
          <Select value={selectedAgeGroup} onValueChange={onAgeGroupChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {currentAgeGroups.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

export default AnimalSelectionPanel;
