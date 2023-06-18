export interface IUnitState {
  unitHealth: number;
  unitIsOnFire: boolean;
  unitColor: number;
  unitDecalColor: number;
  flameSustainability: number;
  fireHP: number;
}

export interface IUnitStateShorthand {
  h: number; // unitHealth
  f: number; // unitIsOnFire
  c: number; // unitColor
  d: number; // unitDecalColor
  s: number; // flameSustainability
  j: number; // fireHP
}
