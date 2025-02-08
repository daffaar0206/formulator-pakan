interface NutritionalRequirement {
  pk: number;
  lk: number;
  sk: number;
  tdn: number;
  calcium: number;
}

type AgeGroup =
  | "calf"
  | "heifer"
  | "adult"
  | "yearling"
  | "starter"
  | "grower"
  | "finisher"
  | "chick"
  | "pullet"
  | "layer";

type AnimalType =
  | "dairy-cattle"
  | "beef-cattle"
  | "broiler-chicken"
  | "layer-chicken";

export const nutritionalRequirements: Record<
  AnimalType,
  Record<AgeGroup, NutritionalRequirement>
> = {
  "dairy-cattle": {
    calf: { pk: 18, lk: 3, sk: 8, tdn: 75, calcium: 0.7 },
    heifer: { pk: 14, lk: 3, sk: 15, tdn: 65, calcium: 0.6 },
    adult: { pk: 16, lk: 4, sk: 17, tdn: 70, calcium: 0.5 },
  },
  "beef-cattle": {
    calf: { pk: 17, lk: 3, sk: 10, tdn: 70, calcium: 0.6 },
    yearling: { pk: 13, lk: 3, sk: 15, tdn: 65, calcium: 0.5 },
    adult: { pk: 12, lk: 3, sk: 18, tdn: 60, calcium: 0.4 },
  },
  "broiler-chicken": {
    starter: { pk: 23, lk: 5, sk: 4, tdn: 75, calcium: 1.0 },
    grower: { pk: 20, lk: 6, sk: 4, tdn: 70, calcium: 0.9 },
    finisher: { pk: 18, lk: 7, sk: 4, tdn: 70, calcium: 0.8 },
  },
  "layer-chicken": {
    chick: { pk: 20, lk: 4, sk: 4, tdn: 75, calcium: 1.0 },
    pullet: { pk: 16, lk: 4, sk: 5, tdn: 70, calcium: 1.2 },
    layer: { pk: 18, lk: 5, sk: 6, tdn: 70, calcium: 4.0 },
  },
};

export const createNewAnimalType = (
  type: string,
  requirements: Record<string, NutritionalRequirement>,
) => {
  nutritionalRequirements[type] = requirements;
};

export const updateRequirements = (
  type: AnimalType,
  age: AgeGroup,
  newRequirements: Partial<NutritionalRequirement>,
) => {
  if (nutritionalRequirements[type] && nutritionalRequirements[type][age]) {
    nutritionalRequirements[type][age] = {
      ...nutritionalRequirements[type][age],
      ...newRequirements,
    };
  }
};
