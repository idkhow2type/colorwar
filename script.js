import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';

window.game = new Game({
    rows: 7,
    columns: 7,
    player: false,
    io: [DOMIOHandler, document.querySelector('.grid')],
});

window.bot = new Bot(window.game);
window.play = () => {
    const interval = setInterval(() => {
        if (window.game.gameOver()) {
            clearInterval(interval);
            return;
        }
        const {cell, value} = window.bot.bestMove(5);
        window.game.update(cell.row, cell.column);
        console.log(value);
    }, 500);
};
