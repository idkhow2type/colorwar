import Game from './Game.js';
import { DOMIOHandler } from './IOHandler.js';
import { BotWorker } from './Bot.js';
import { sleep } from './utils.js';

const settings = {
    rows: 7,
    columns: 7,
    p1: {
        type: 'bot',
        depth: 6,
        scalers: [3, 1.6, 1.3],
    },
    p2: {
        type: 'bot',
        depth: 6,
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
window.bot1 = bot1Worker;
window.bot2 = bot2Worker;

io.render();
async function play() {
    let move;

    if (game.currentPlayer) {
        if (settings.p2.type === 'human') {
            move = await io.getCell();
        } else {
            const best = await bot1Worker.getBest();
            move = best[Math.floor(Math.random() * best.length)].cell;
        }
    } else {
        if (settings.p1.type === 'human') {
            move = await io.getCell();
        } else {
            const best = await bot2Worker.getBest();
            move = best[Math.floor(Math.random() * best.length)].cell;
        }
    }

    if (move) {
        await game.update(
            move.row,
            move.column,
            (() => {
                let depth = 0;
                return async (queue) => {
                    console.log(game.currentPlayer, [...queue], depth);
                    if (queue.length > 0 && depth === queue[0].depth) return;
                    console.log('rendering');
                    io.render();
                    if (queue.length > 0) await sleep(200);
                    depth++;
                };
            })()
        );
    }
    io.render();
    
    if (game.gameOver()) {
        await sleep(1000);
        location.reload();
    }

    await sleep(200);

    requestAnimationFrame(play);
}

play();
