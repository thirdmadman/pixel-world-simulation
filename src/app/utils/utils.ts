/* eslint-disable no-bitwise */
export const getRandomInt = (min: number, max: number) => {
  const minNumber = Math.ceil(min);
  const maxNumber = Math.floor(max);
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
};

export const mixColors = (colorA: number, colorB: number) => {
  // 0xff11aa00 a B G R
  const alphaB = Number(BigInt(colorB) >> BigInt(24));

  if (alphaB === 255) {
    return colorB;
  }

  const alphaA = Number(BigInt(colorA) >> BigInt(24));

  const alphaAInProc = alphaA / 0xff;
  const alphaBInProc = alphaB / 0xff;
  const colorANoAlpha = Number(BigInt(colorA) & BigInt(0x00ffffff));
  const colorBNoAlpha = Number(BigInt(colorB) & BigInt(0x00ffffff));

  const resultAlpha = (1 - alphaAInProc) * alphaBInProc + alphaAInProc;

  const extract = (
    cA: number,
    cB: number,
    alA: number,
    alB: number,
    rA: number,
  ) => Math.round(((1 - alA) * alB * cB + alA * cA) / rA) || 0;

  const rA = colorANoAlpha & 0xff;
  const gA = (colorANoAlpha & 0xff00) >> 8;
  const bA = (colorANoAlpha & 0xff0000) >> 16;

  const rB = colorBNoAlpha & 0xff;
  const gB = (colorBNoAlpha & 0xff00) >> 8;
  const bB = (colorBNoAlpha & 0xff0000) >> 16;

  const newR = extract(rA, rB, alphaAInProc, alphaBInProc, resultAlpha);
  const newG = extract(gA, gB, alphaAInProc, alphaBInProc, resultAlpha);
  const newB = extract(bA, bB, alphaAInProc, alphaBInProc, resultAlpha);

  const color = ((newB << 16) + (newG << 8) + newR);

  const result = (BigInt((Math.round(resultAlpha * 255))) << BigInt(24)) + BigInt(color);

  return result;
};

export const getNotTransparent = (color: number) => (color & 0x00ffffff) + 0xff000000;
