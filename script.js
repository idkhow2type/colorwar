import Game from './Game.js';
import {DOMIOHandler} from './IOHandler.js';

const game = new Game(
    5,
    5,
    'p1',
    DOMIOHandler,
    document.querySelector('.grid')
);