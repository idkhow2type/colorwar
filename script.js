import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';

const game = new Game({
    rows: 6,
    columns: 6,
    player: false,
    io: [DOMIOHandler, document.querySelector('.grid')],
});
const botTune = new Bot(game, [3, 1.6, -1]);

console.log(game.currentPlayer);
window.play = () => {
    const interval = setInterval(() => {
        if (game.gameOver()) {
            clearInterval(interval);
            return;
        }
        console.time('tune');
        const tuneBest = botTune.minimax(6);
        console.timeEnd('tune');
        const { move: tuneMove, score: tuneScore } =
            tuneBest[Math.floor(Math.random() * tuneBest.length)];
        game.update(tuneMove.row, tuneMove.column);
    }, 500);
};
window.play()

window.game = game;
window.bot = botTune;
