import './scss/style.scss';

import { App } from './app/App';

const game = new App();

game.setScreenSize(document.body.offsetWidth, document.body.offsetHeight);
game.setPixelSize(6);
game.start();
