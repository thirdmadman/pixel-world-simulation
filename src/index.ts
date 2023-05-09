import './scss/style.scss';

import { App } from './app/App';

const game = new App();
game.setScreenSize(1000, 1000);
game.setPixelSize(10);
game.start();
