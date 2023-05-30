import UnitType from './UnitType';

interface IUnitTypesStringsToIndex {
  [propName: string]: number;
}

export const UnitTypesStringsToIndex = {
  'yellow-sand': 0,
  'pure-water': 1,
  'gray-rock': 2,
  'flammable-gas': 3,
  'red-blood': 4,
} as IUnitTypesStringsToIndex;

// Air density 0,00127 (1 Ton/m3)

// Colors order in 0x00caca is B G R

export const UnitTypesArray = [
  {
    unitName: 'yellow-sand',
    unitIsLiquid: false,
    unitIsStatic: false,
    unitIsGas: false,
    unitIsFlammable: false,
    unitDefaultHealth: 10,
    unitDensity: 1.5,
    unitDefaultColor: {
      minRandomColor: 0x0a,
      maxRandomColor: 0x35,
      baseColor: 0x00caca + 0xff000000,
    },
    unitTransformations: {
      toFreeze: 'yellow-sand',
      toLiquid: 'molten-glass',
      toVapor: null,
      toDestroy: null,
      toCorrode: null,
    },
  },
  {
    unitName: 'pure-water',
    unitIsLiquid: true,
    unitIsStatic: false,
    unitIsGas: false,
    unitIsFlammable: false,
    unitDefaultHealth: 10,
    unitDensity: 1,
    unitDefaultColor: {
      minRandomColor: 0x0,
      maxRandomColor: 0x0,
      baseColor: 0xffd900 + 0x77000000,
    },
    unitTransformations: {
      toFreeze: 'pure-ice',
      toLiquid: 'pure-water',
      toVapor: 'water-steam',
      toDestroy: 'water-steam',
      toCorrode: 'water-steam',
    },
  },
  {
    unitName: 'gray-rock',
    unitIsLiquid: false,
    unitIsStatic: true,
    unitIsGas: false,
    unitIsFlammable: false,
    unitDefaultHealth: 100,
    unitDensity: 2.6,
    unitDefaultColor: {
      minRandomColor: 0x0a,
      maxRandomColor: 0x52,
      baseColor: 0x818181 + 0xff000000,
    },
    unitTransformations: {
      toFreeze: null,
      toLiquid: 'molten-rock',
      toVapor: null,
      toDestroy: null,
      toCorrode: null,
    },
  },
  {
    unitName: 'flammable-gas',
    unitIsLiquid: false,
    unitIsStatic: false,
    unitIsGas: true,
    unitIsFlammable: true,
    unitDefaultHealth: 10,
    unitDensity: 0.00182,
    unitDefaultColor: {
      minRandomColor: 0x0a,
      maxRandomColor: 0x52,
      baseColor: 0x11aa00 + 0x33000000,
    },
    unitTransformations: {
      toFreeze: null,
      toLiquid: 'flammable-liquid',
      toVapor: null,
      toDestroy: null,
      toCorrode: null,
    },
  },
  {
    unitName: 'red-blood',
    unitIsLiquid: true,
    unitIsStatic: false,
    unitIsGas: false,
    unitIsFlammable: false,
    unitDefaultHealth: 10,
    unitDensity: 1.030,
    unitDefaultColor: {
      minRandomColor: 0x00,
      maxRandomColor: 0x00,
      baseColor: 0x0000b1 + 0xff000000,
    },
    unitTransformations: {
      toFreeze: 'frozen-red-blood',
      toLiquid: null,
      toVapor: null,
      toDestroy: null,
      toCorrode: null,
    },
  },
] as Array<UnitType>;

export const getUnitTypeByUnitTypeName = (unitTypeName: string) => {
  const unitIndex = UnitTypesStringsToIndex[unitTypeName];
  return UnitTypesArray[unitIndex];
};
