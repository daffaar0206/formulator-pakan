import React, { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { nutritionalRequirements } from "@/lib/nutritionalRequirements";

interface AnimalSelectionPanelProps {
  selectedAnimalType: string;
  selectedAgeGroup: string;
  onAnimalTypeChange: (type: string) => void;
  onAgeGroupChange: (group: string) => void;
}

const AnimalSelectionPanel: React.FC<AnimalSelectionPanelProps> = ({
  selectedAnimalType,
  selectedAgeGroup,
  onAnimalTypeChange,
  onAgeGroupChange,
}) => {
  const [animalTypes, setAnimalTypes] = useState<string[]>([]);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);

  // Update animal types when nutritionalRequirements changes
  useEffect(() => {
    const updateAnimalTypes = () => {
      setAnimalTypes(Object.keys(nutritionalRequirements));
    };

    // Initial load
    updateAnimalTypes();

    // Listen for updates
    window.addEventListener('requirementsUpdated', updateAnimalTypes);

    return () => {
      window.removeEventListener('requirementsUpdated', updateAnimalTypes);
    };
  }, []);

  // Update age groups when animal type changes
  useEffect(() => {
    const updateAgeGroups = () => {
      if (selectedAnimalType && nutritionalRequirements[selectedAnimalType]) {
        const newAgeGroups = Object.keys(nutritionalRequirements[selectedAnimalType]);
        setAgeGroups(newAgeGroups);
        
        // If current age group is not in new list, select first available
        if (!newAgeGroups.includes(selectedAgeGroup) && newAgeGroups.length > 0) {
          onAgeGroupChange(newAgeGroups[0]);
        }
      }
    };

    // Initial load
    updateAgeGroups();

    // Listen for updates
    window.addEventListener('requirementsUpdated', updateAgeGroups);

    return () => {
      window.removeEventListener('requirementsUpdated', updateAgeGroups);
    };
  }, [selectedAnimalType, selectedAgeGroup, onAgeGroupChange]);

  const handleAnimalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    onAnimalTypeChange(newType);
    
    // Select first age group of new animal type
    const newAgeGroups = Object.keys(nutritionalRequirements[newType] || {});
    if (newAgeGroups.length > 0) {
      onAgeGroupChange(newAgeGroups[0]);
    }
  };

  const formatLabel = (text: string) => {
    return text.split("-").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <Card className="p-4 sm:p-6 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jenis Hewan
          </label>
          <select
            value={selectedAnimalType}
            onChange={handleAnimalTypeChange}
            className="w-full p-2 border rounded-md bg-white"
          >
            {animalTypes.map((type) => (
              <option key={type} value={type}>
                {formatLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kelompok Umur
          </label>
          <select
            value={selectedAgeGroup}
            onChange={(e) => onAgeGroupChange(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            {ageGroups.map((group) => (
              <option key={group} value={group}>
                {formatLabel(group)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};

export default AnimalSelectionPanel;
