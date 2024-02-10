import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';

const game = new Game({
    rows: 5,
    columns: 5,
    player: false,
    io: [DOMIOHandler, document.querySelector('.grid')],
});
const bot = new Bot(game);

console.log(game.currentPlayer);
window.play = () => {
    const interval = setInterval(async () => {
        if (game.gameOver()) {
            clearInterval(interval);
            return;
        }
        console.time('minimax');
        const best = await bot.minimax(6);
        console.timeEnd('minimax');
        const { move, score } = best[Math.floor(Math.random() * best.length)];
        game.update(move.row, move.column);
        console.log(best, score);
    }, 500);
};
window.play();

window.game = game;
window.bot = bot;
