/* eslint-disable class-methods-use-this */
import { IPixelsLayer } from '../interfaces/IPixelsLayer';
import { IPlayer } from '../interfaces/IPlayer';
import { IPoint } from '../interfaces/IPoint';

export class PlayersEngine {
  private players: Array<IPlayer> = [];

  private layers: Array<IPixelsLayer> = [];

  private framePosition: IPoint = { x: 0, y: 0 };

  setFramePosition(framePosition: IPoint) {
    this.framePosition = framePosition;
  }

  constructor() {
    this.players.push({
      name: 'Player0',
      globalPosition: { x: 0, y: 0 },
      desiredDeltaPosition: { x: 0, y: 0 },
      cursorGlobalPosition: { x: 10, y: 10 },
      spriteWidth: 10,
      spriteHeight: 10,
      spriteOffset: { x: 0, y: 0 },
      hitBoxWidth: 6,
      hitBoxHeight: 10,
      health: 100,
    });
    this.initLayers();
  }

  addPlayerDeltaPosition(id: number, deltaPosition: IPoint) {
    if (!this.players[id]) {
      return false;
    }

    this.players[id].desiredDeltaPosition.x += deltaPosition.x;
    this.players[id].desiredDeltaPosition.y += deltaPosition.y;

    return true;
  }

  initLayers() {
    this.layers.push({
      width: 6,
      height: 16,
      x: 0,
      y: 0,
      pixels: this.drawPlayer(),
    });
  }

  drawPlayer() {
    const pixels = new Uint32Array(6 * 16);
    pixels[0] = 0xff000000;
    pixels[5] = 0xff000000;
    pixels[36] = 0xff000000;
    pixels[41] = 0xff000000;
    pixels[90] = 0xff000000;
    pixels[95] = 0xff000000;
    return pixels;
  }

  updatePlayersPosition() {
    this.players.forEach((player) => {
      if (player.globalPosition.x + player.desiredDeltaPosition.x >= 0) {
        player.globalPosition.x += player.desiredDeltaPosition.x;
      }

      if (player.globalPosition.y + player.desiredDeltaPosition.y >= 0) {
        player.globalPosition.y += player.desiredDeltaPosition.y;
      }

      this.layers[0].x = player.globalPosition.x - this.framePosition.x;
      this.layers[0].y = player.globalPosition.y - this.framePosition.y;

      player.desiredDeltaPosition.x = 0;
      player.desiredDeltaPosition.y = 0;
    });
  }

  getPlayer(id: number) {
    return this.players[id];
  }

  getLayers() {
    this.updatePlayersPosition();
    return this.layers;
  }
}
