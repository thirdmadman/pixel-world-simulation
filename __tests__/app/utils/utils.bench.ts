/* eslint-disable no-bitwise */
import { bench, describe } from 'vitest';
import { getRandomInt, mixColors } from '../../../src/app/utils/utils';

const createArrayOfColors = (colorsNumber: number) => {
  const generateRandomColor = () => {
    const r = getRandomInt(0, 255);
    const g = (getRandomInt(0, 255) << 4);
    const b = (getRandomInt(0, 255) << 8);
    const a = (getRandomInt(0, 255) << 16);

    return r | g | b | a;
  };

  return Array.from(Array(colorsNumber)).map(() => generateRandomColor());
};

const array100 = createArrayOfColors(100);
const array1000 = createArrayOfColors(1000);
const array10000 = createArrayOfColors(10000);
const array100000 = createArrayOfColors(100000);
const array1000000 = createArrayOfColors(1000000);

describe('array', () => {
  bench('100', () => {
    array100.reduce((prev, acc) => mixColors(acc, prev) as number);
  });

  bench('1000', () => {
    array1000.reduce((prev, acc) => mixColors(acc, prev) as number);
  });

  bench('10000', () => {
    array10000.reduce((prev, acc) => mixColors(acc, prev) as number);
  });

  bench('100000', () => {
    array100000.reduce((prev, acc) => mixColors(acc, prev) as number);
  });

  bench('1000000', () => {
    array1000000.reduce((prev, acc) => mixColors(acc, prev) as number);
  });
});
