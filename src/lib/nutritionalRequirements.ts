interface NutritionalRequirement {
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  em: number;  // Energi Metabolisme (Kkal/kg)
  calcium: number;
}

type AnimalRequirements = Record<string, Record<string, NutritionalRequirement>>;

const REQUIREMENTS_STORAGE_KEY = 'formulator-requirements';

// Default requirements
const defaultRequirements: AnimalRequirements = {
  "dairy-cattle": {
    calf: { pk: 18, lk: 3, sk: 8, tdn: 75, em: 2800, calcium: 0.7 },
    heifer: { pk: 14, lk: 3, sk: 15, tdn: 65, em: 2400, calcium: 0.6 },
    adult: { pk: 16, lk: 4, sk: 17, tdn: 70, em: 2600, calcium: 0.5 },
  },
  "beef-cattle": {
    calf: { pk: 17, lk: 3, sk: 10, tdn: 70, em: 2700, calcium: 0.6 },
    yearling: { pk: 13, lk: 3, sk: 15, tdn: 65, em: 2500, calcium: 0.5 },
    adult: { pk: 12, lk: 3, sk: 18, tdn: 60, em: 2300, calcium: 0.4 },
  },
  "broiler-chicken": {
    starter: { pk: 23, lk: 5, sk: 4, tdn: 75, em: 3000, calcium: 1.0 },
    grower: { pk: 20, lk: 6, sk: 4, tdn: 70, em: 2900, calcium: 0.9 },
    finisher: { pk: 18, lk: 7, sk: 4, tdn: 70, em: 2800, calcium: 0.8 },
  },
  "layer-chicken": {
    chick: { pk: 20, lk: 4, sk: 4, tdn: 75, em: 2900, calcium: 1.0 },
    pullet: { pk: 16, lk: 4, sk: 5, tdn: 70, em: 2700, calcium: 1.2 },
    layer: { pk: 18, lk: 5, sk: 6, tdn: 70, em: 2800, calcium: 4.0 },
  },
};

// Load saved requirements or use defaults
const loadRequirements = (): AnimalRequirements => {
  const savedRequirements = localStorage.getItem(REQUIREMENTS_STORAGE_KEY);
  if (savedRequirements) {
    try {
      return JSON.parse(savedRequirements);
    } catch (e) {
      console.error('Error loading requirements:', e);
      return defaultRequirements;
    }
  }
  return defaultRequirements;
};

// Initialize requirements
export let nutritionalRequirements = loadRequirements();

// Save requirements and notify subscribers
const saveRequirements = () => {
  try {
    localStorage.setItem(REQUIREMENTS_STORAGE_KEY, JSON.stringify(nutritionalRequirements));
    window.dispatchEvent(new Event('requirementsUpdated'));
  } catch (e) {
    console.error('Error saving requirements:', e);
  }
};

// Update requirements for existing animal type and age group
export const updateRequirements = (
  type: string,
  age: string,
  newRequirements: Partial<NutritionalRequirement>,
) => {
  if (!nutritionalRequirements[type]) {
    nutritionalRequirements[type] = {};
  }
  
  if (!nutritionalRequirements[type][age]) {
    nutritionalRequirements[type][age] = {
      pk: 0,
      lk: 0,
      sk: 0,
      tdn: 0,
      em: 0,
      calcium: 0,
    };
  }

  nutritionalRequirements[type][age] = {
    ...nutritionalRequirements[type][age],
    ...newRequirements,
  };

  saveRequirements();
};

// Add new animal type with requirements
export const addAnimalType = (
  animalData: {
    type: string;
    ageGroup: string;
    requirements: NutritionalRequirement;
  }
) => {
  const { type, ageGroup, requirements } = animalData;
  
  if (!nutritionalRequirements[type]) {
    nutritionalRequirements[type] = {};
  }

  nutritionalRequirements[type][ageGroup] = requirements;
  saveRequirements();
};

// Add new age group to existing animal type
export const addAgeGroup = (
  type: string,
  ageGroup: string,
  requirements: NutritionalRequirement,
) => {
  if (!nutritionalRequirements[type]) {
    throw new Error(`Animal type ${type} does not exist`);
  }

  nutritionalRequirements[type][ageGroup] = requirements;
  saveRequirements();
};

// Delete animal type
export const deleteAnimalType = (type: string) => {
  if (Object.keys(nutritionalRequirements).length <= 1) {
    throw new Error("Cannot delete last animal type");
  }
  
  delete nutritionalRequirements[type];
  saveRequirements();
};

// Delete age group from animal type
export const deleteAgeGroup = (type: string, ageGroup: string) => {
  if (!nutritionalRequirements[type]) {
    throw new Error(`Animal type ${type} does not exist`);
  }

  if (Object.keys(nutritionalRequirements[type]).length <= 1) {
    throw new Error("Cannot delete last age group");
  }

  delete nutritionalRequirements[type][ageGroup];
  saveRequirements();
};

// Reset requirements to defaults
export const resetRequirements = () => {
  nutritionalRequirements = defaultRequirements;
  localStorage.removeItem(REQUIREMENTS_STORAGE_KEY);
  window.dispatchEvent(new Event('requirementsUpdated'));
};

export type { NutritionalRequirement, AnimalRequirements };
