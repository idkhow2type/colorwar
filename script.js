import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import { BotWorker } from './Bot.js';
import { sleep } from './utils.js';

const settings = {
    rows: 7,
    columns: 7,
    p1: {
        type: 'bot',
        depth: 2,
        scalers: [3, 1.6, 1.3],
        minDelay: 100,
    },
    p2: {
        type: 'human',
        depth: 3,
        scalers: [3, 1.6, 1],
        minDelay: 100,
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

const bot1Worker = new BotWorker(
    'bot1',
    game,
    settings.p1.scalers,
    settings.p1.depth
);
const bot2Worker = new BotWorker(
    'bot2',
    game,
    settings.p2.scalers,
    settings.p2.depth
);

window.game = game;
window.io = io;

io.render();
async function play() {
    if (settings.p1.type === 'human') {
        await io.playTurn();
    } else {
        const start = performance.now();
        const best = await bot1Worker.getBest();
        const { move } = best[Math.floor(Math.random() * best.length)];
        game.update(move.row, move.column);
        const end = performance.now();
        if (end - start < settings.p1.minDelay)
            await sleep(settings.p1.minDelay - end + start);
    }

    io.render();
    if (game.gameOver()) {
        await sleep(1000)
        location.reload()
    }

    if (settings.p2.type === 'human') {
        await io.playTurn();
    } else {
        const start = performance.now();
        const best = await bot2Worker.getBest();
        const { move } = best[Math.floor(Math.random() * best.length)];
        game.update(move.row, move.column);
        const end = performance.now();
        if (end - start < settings.p2.minDelay)
            await sleep(settings.p2.minDelay - end + start);
    }

    io.render();
    if (game.gameOver()) {
        await sleep(1000)
        location.reload()
    }

    requestAnimationFrame(play);
}

play();
