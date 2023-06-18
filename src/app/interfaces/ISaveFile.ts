import { IWorldStateSave } from './IWorldStateSave';

export interface ISaveFile {
  frameWidth: number;
  frameHeight: number;
  framePositionX: number;
  framePositionY: number;
  worldSideSize: number;
  lastUnitId: number;
  worldSate: IWorldStateSave;
}
