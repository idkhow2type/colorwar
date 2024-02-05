import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';

window.game = new Game({
    rows: 5,
    columns: 7,
    player: false,
    io: [DOMIOHandler, document.querySelector('.grid')],
});

window.bot = new Bot(window.game);
// const moves = window.bot.bestMoves(6);
// const { cell, value } = moves.at(-1);
// window.game.update(cell.row, cell.column);
window.play = () => {
    const interval = setInterval(() => {
        if (window.game.gameOver()) {
            clearInterval(interval);
            return;
        }
        const moves = window.bot.bestMoves(6);
        const { cell, value } = moves.at(-1);
        window.game.update(cell.row, cell.column);
    }, 500);
};
