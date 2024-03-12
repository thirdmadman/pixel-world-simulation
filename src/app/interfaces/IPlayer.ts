import { IPoint } from './IPoint';

export interface IPlayer {
  name: string;
  globalPosition: IPoint;
  desiredDeltaPosition: IPoint;
  mouseGlobalPosition: IPoint;
  spriteWidth: number;
  spriteHeight: number;
  spriteOffset: IPoint;
  hitBoxWidth: number;
  hitBoxHeight: number;
  health: number;
}
