import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';

const game = new Game({
    rows: 3,
    columns: 7,
    player: Math.random() < 0.5,
    io: [DOMIOHandler, document.querySelector('.grid')],
});
const bot = new Bot(game);

console.log(game.currentPlayer);
window.play = () => {
    const interval = setInterval(() => {
        if (game.gameOver()) {
            clearInterval(interval);
            return;
        }
        const moves = bot.bestMoves(6);
        const { cell, value } = moves[Math.floor(Math.random() * moves.length)];
        game.update(cell.row, cell.column);
        console.log(moves, value);
    }, 500);
};
window.play();

window.game = game;
window.bot = bot;
