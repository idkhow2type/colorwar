import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import { BotWorker } from './Bot.js';
import { sleep } from './utils.js';

const settings = {
    rows: 7,
    columns: 7,
    p1: {
        type: 'bot',
        depth: 4,
        scalers: [3, 1.6, 1.3],
    },
    p2: {
        type: 'human',
        depth: 4,
        scalers: [3, 1.6, 1.3],
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
    let move;

    if (settings.p1.type === 'human') {
        move = await io.getCell();
    } else {
        const best = await bot1Worker.getBest();
        move = best[Math.floor(Math.random() * best.length)].move;
    }

    if (move) {
        await game.update(move.row, move.column, async () => {
            await sleep(200);
            io.render();
        });
    }

    if (game.gameOver()) {
        await sleep(1000);
        location.reload();
    }


    if (settings.p2.type === 'human') {
        move = await io.getCell();
    } else {
        const best = await bot2Worker.getBest();
        move = best[Math.floor(Math.random() * best.length)].move;
    }

    if (move) {
        await game.update(move.row, move.column, async () => {
            await sleep(200);
            io.render();
        });
    }

    if (game.gameOver()) {
        await sleep(1000);
        location.reload();
    }

    requestAnimationFrame(play);
}

play();
