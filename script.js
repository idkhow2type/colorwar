import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';

window.game = new Game({
    rows: 5,
    columns: 5,
    player: false,
    io: [DOMIOHandler, document.querySelector('.grid')],
});
window.bot = new Bot(window.game.board, true);
