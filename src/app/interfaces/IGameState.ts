import { IPoint } from './IPoint';
import { WorldState } from './WorldState';

export interface IGameState {
  frameWidth : number;
  frameHeight : number;
  framePositionX : number;
  framePositionY : number;
  worldSquareSide : number;
  cursorPosition: IPoint;
  lastCursorPosition: IPoint;
  lastUnitId : number;
  gameWorldState: WorldState;
}
