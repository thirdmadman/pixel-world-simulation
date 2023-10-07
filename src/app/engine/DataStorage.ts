/* eslint-disable class-methods-use-this */
import { IGameState } from '../interfaces/IGameState';
import { ISaveFile } from '../interfaces/ISaveFile';
import { IUnitState } from '../interfaces/IUnitState';
import { IVector } from '../interfaces/IVector';
import { IWorldStateSave } from '../interfaces/IWorldStateSave';
import { WorldState } from '../interfaces/WorldState';
import { IUnitShorthand, Unit } from '../models/Unit';

export class DataStorage {
  convertWorldStateToSave(gameState: IGameState) {
    const { gameWorldState, worldSquareSide } = gameState;

    const worldObj = {} as IWorldStateSave;
    for (let x = 0; x < worldSquareSide; x += 1) {
      for (let y = 0; y < worldSquareSide; y += 1) {
        if (gameWorldState[x][y] != null) {
          if (!worldObj[x]) {
            worldObj[x] = {};
          }
          worldObj[x][y] = gameWorldState[x][y]?.toJson() as IUnitShorthand;
        }
      }
    }
    return worldObj;
  }

  serializeToSaveFile(gameState: IGameState) {
    const saveObject = {
      frameWidth: gameState.frameWidth,
      frameHeight: gameState.frameHeight,
      framePositionX: gameState.framePositionX,
      framePositionY: gameState.framePositionY,
      worldSideSize: gameState.worldSquareSide,
      lastUnitId: gameState.lastUnitId,
      worldSate: this.convertWorldStateToSave(gameState),
    };
    console.error(saveObject);
    return JSON.stringify(saveObject);
  }

  convertSaveToWorldState(save: IWorldStateSave, worldSquareSide: number) {
    const nodes = new Array(worldSquareSide);
    const copy = new Array(worldSquareSide);
    for (let i = 0; i < worldSquareSide; i++) {
      copy[i] = null;
    }

    for (let i = 0; i < nodes.length; i++) {
      nodes[i] = copy.slice(0);
    }

    const newWorldState = nodes as WorldState;

    Object.keys(save).forEach((keyX) => {
      if (save[parseInt(keyX, 10)]) {
        Object.keys(save[parseInt(keyX, 10)]).forEach((keyY) => {
          if (save[parseInt(keyX, 10)][parseInt(keyY, 10)]) {
            const u = save[parseInt(keyX, 10)][parseInt(keyY, 10)];

            const state = {
              unitHealth: u.s.h,
              unitIsOnFire: Boolean(u.s.f),
              unitColor: u.s.c,
              unitDecalColor: u.s.d,
              flameSustainability: u.s.s,
              fireHP: u.s.j,
            } as IUnitState;

            const vector = u.v ? ({ startPoint: u.v.s, endPoint: u.v.e } as IVector) : null;

            const unit = new Unit(u.n, vector, u.i, state);
            newWorldState[parseInt(keyX, 10)][parseInt(keyY, 10)] = unit;
          }
        });
      }
    });
    return newWorldState;
  }

  deserializeAnLoadFromFile(file: string) {
    const saveObject = JSON.parse(file) as ISaveFile;
    if (file && file[0] === '{') {
      const saveObjectKeysNumber = Object.keys(saveObject).length;
      if (saveObject && saveObjectKeysNumber > 0) {
        if (saveObject.worldSate) {
          return {
            frameWidth: saveObject.frameWidth,
            frameHeight: saveObject.frameHeight,
            framePositionX: saveObject.framePositionX,
            framePositionY: saveObject.framePositionY,
            worldSquareSide: saveObject.worldSideSize,
            lastUnitId: saveObject.lastUnitId,
            gameWorldState: this.convertSaveToWorldState(saveObject.worldSate, saveObject.worldSideSize),
          } as IGameState;
        }
      }
    }
    return null;
  }

  saveToLocalStorage(gameState: IGameState) {
    localStorage.setItem('pws-save', this.serializeToSaveFile(gameState));
  }

  loadFromLocalStorage() {
    const src = localStorage.getItem('pws-save');
    if (src) {
      return this.deserializeAnLoadFromFile(src);
    }
    return null;
  }
}
