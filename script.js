import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import Bot from './Bot.js';
import { sleep } from './utils.js';

const settings = {
    rows: 6,
    columns: 6,
    p1: {
        type: 'bot',
        depth: 6,
        evalScalers: [3, 1.6, 1],
    },
    p2: {
        type: 'bot',
        depth: 6,
        evalScalers: [3, 1.6, 1],
    },
};

// document.querySelectorAll('.game-settings input').forEach((input) => {
//     input.addEventListener('change', (event) => {
//         const { name, value } = event.target;
//         console.log(name, value);
//     });
// });

// console.log(settings);

const game = new Game({
    rows: settings.rows,
    columns: settings.columns,
    player: false,
});
const io = new DOMIOHandler(
    game,
    document.querySelector('.grid'),
    document.body
);
io.render();

const bot1 = new Bot(game, settings.p1.evalScalers);
const bot2 = new Bot(game, settings.p2.evalScalers);

async function play() {
    if (settings.p1.type === 'human') {
        await io.playTurn();
    } else {
        const best = bot1.minimax(settings.p1.depth);
        const { move } = best[Math.floor(Math.random() * best.length)];
        game.update(move.row, move.column);
        await sleep(500)
    }

    io.render();
    if (game.gameOver()) return;

    if (settings.p2.type === 'human') {
        await io.playTurn();
    } else {
        const best = bot2.minimax(settings.p2.depth);
        const { move } = best[Math.floor(Math.random() * best.length)];
        game.update(move.row, move.column);
        await sleep(500)
    }

    io.render();
    if (game.gameOver()) return;

    requestAnimationFrame(play);
}

play();
