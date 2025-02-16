const mazeContainer = document.getElementById("maze");
const size = 15;
let playerPosition = { x: 0, y: 0 };
let exitPosition = { x: size - 1, y: size - 1 };
let enemyPosition = { x: size - 1, y: size - 2 }; // Posición diferente a la salida
let maze = [];
let enemyInterval; // Variable para controlar el intervalo

function generateMaze() {
    // Limpiar intervalo anterior
    if (enemyInterval) clearInterval(enemyInterval);
    
    // Reiniciar posiciones
    playerPosition = { x: 0, y: 0 };
    exitPosition = { x: size - 1, y: size - 1 };
    enemyPosition = { x: size - 1, y: size - 2 };
    
    maze = Array.from({ length: size }, () => Array(size).fill(1));
    const stack = [{ x: 0, y: 0 }];
    maze[0][0] = 0;

    while (stack.length) {
        const current = stack.pop();
        const neighbors = getValidNeighbors(current);

        if (neighbors.length) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
            maze[next.y][next.x] = 0;
            stack.push(next);
        }
    }

    ensurePathToExit();
    openRandomWalls(0.32);
    
    // Asegurar posiciones clave
    maze[0][0] = 0; // Posición inicial
    maze[exitPosition.y][exitPosition.x] = 0; // Salida
    maze[enemyPosition.y][enemyPosition.x] = 0; // Enemigo
    
    renderMaze();
    startEnemyMovement();
}

function startEnemyMovement() {
    enemyInterval = setInterval(() => {
        let queue = [{ x: enemyPosition.x, y: enemyPosition.y, path: [] }];
        let visited = Array.from({ length: size }, () => Array(size).fill(false));
        visited[enemyPosition.y][enemyPosition.x] = true;

        while (queue.length) {
            let { x, y, path } = queue.shift();
            if (x === playerPosition.x && y === playerPosition.y) {
                if (path.length === 0) break; // Ya está en la posición
                let nextMove = path[0];
                enemyPosition = nextMove;
                renderMaze();
                // Verificar colisión después de mover
                if (playerPosition.x === enemyPosition.x && playerPosition.y === enemyPosition.y) {
                    clearInterval(enemyInterval);
                    alert("¡El enemigo te atrapó!");
                    generateMaze();
                }
                return;
            }

            // Movimientos posibles
            const directions = [
                {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
            ];
            
            for (let dir of directions) {
                let nx = x + dir.x, ny = y + dir.y;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && 
                    maze[ny][nx] === 0 && !visited[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({ x: nx, y: ny, path: [...path, { x: nx, y: ny }] });
                }
            }
        }
    }, 226);
}


function openRandomWalls(probability) {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (maze[y][x] === 1 && Math.random() < probability) {
                maze[y][x] = 0;
            }
        }
    }
}

function ensurePathToExit() {
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    function dfs(x, y) {
        if (x === exitPosition.x && y === exitPosition.y) return true;
        visited[y][x] = true;
        const directions = [
            { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }
        ];
        for (const dir of directions) {
            const nx = x + dir.x, ny = y + dir.y;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && maze[ny][nx] === 0 && !visited[ny][nx]) {
                if (dfs(nx, ny)) return true;
            }
        }
        return false;
    }

    if (!dfs(0, 0)) {
        maze[exitPosition.y][exitPosition.x] = 0; // Abrir la salida si no hay camino
    }
}

function getValidNeighbors({ x, y }) {
    const directions = [
        { x: 0, y: -2 }, { x: 0, y: 2 }, { x: -2, y: 0 }, { x: 2, y: 0 }
    ];
    return directions.map(dir => ({ x: x + dir.x, y: y + dir.y }))
        .filter(pos => pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size && maze[pos.y][pos.x] === 1);
}

function renderMaze() {
    mazeContainer.innerHTML = "";
    mazeContainer.style.gridTemplateColumns = `repeat(${size}, 40px)`;
    
    maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement("div");
            div.className = `cell ${cell ? 'wall' : 'path'} 
                ${x === playerPosition.x && y === playerPosition.y ? 'player' : ''}
                ${x === exitPosition.x && y === exitPosition.y ? 'exit' : ''}
                ${x === enemyPosition.x && y === enemyPosition.y ? 'enemy' : ''}`; // Clase enemy
            mazeContainer.appendChild(div);
        });
    });
}
document.addEventListener("keydown", (e) => {
    const moves = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
    const move = moves[e.key];
    if (!move) return;
    const newX = playerPosition.x + move.x;
    const newY = playerPosition.y + move.y;
    if (newX >= 0 && newX < size && newY >= 0 && newY < size && maze[newY][newX] === 0) {
        playerPosition = { x: newX, y: newY };
        renderMaze();
        if (playerPosition.x === exitPosition.x && playerPosition.y === exitPosition.y) {
            setTimeout(() => { alert("¡Has escapado!"); playerPosition = { x: 0, y: 0 }; generateMaze(); }, 100);
        }
    }
});

generateMaze();