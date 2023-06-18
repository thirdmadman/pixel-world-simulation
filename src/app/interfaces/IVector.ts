import { IPoint } from './IPoint';

export interface IVector {
  startPoint: IPoint;
  endPoint: IPoint;
}

export interface IVectorShorthand {
  s: IPoint; // startPoint
  e: IPoint; // endPoint
}
