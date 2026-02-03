const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 全局状态变量
let gameState = {
  moveCount: 0,
  playerX: 0,
  playerY: 0,
  pathLength: 0
};

const TILE_SIZE = 50;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;
const OBSTACLE_RATE = 0.3;

let map = [];
let player;
let graphics;
let path = [];
let pathIndex = 0;
let isMoving = false;
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  graphics = this.add.graphics();
  
  // 创建地面纹理（绿色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x4CAF50, 1);
  groundGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  groundGraphics.lineStyle(2, 0x388E3C, 1);
  groundGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  groundGraphics.generateTexture('ground', TILE_SIZE, TILE_SIZE);
  groundGraphics.destroy();
  
  // 创建障碍物纹理（灰色）
  const obstacleGraphics = this.add.graphics();
  obstacleGraphics.fillStyle(0x757575, 1);
  obstacleGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  obstacleGraphics.lineStyle(2, 0x424242, 1);
  obstacleGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  obstacleGraphics.generateTexture('obstacle', TILE_SIZE, TILE_SIZE);
  obstacleGraphics.destroy();
  
  // 创建玩家纹理（蓝色圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x2196F3, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();
  
  // 初始化地图数组（0=可行走，1=障碍）
  initializeMap();
  
  // 渲染地图
  renderMap(this);
  
  // 创建玩家
  player = this.add.sprite(
    TILE_SIZE / 2,
    TILE_SIZE / 2,
    'player'
  );
  gameState.playerX = 0;
  gameState.playerY = 0;
  
  // 点击事件
  this.input.on('pointerdown', (pointer) => {
    if (isMoving) return;
    
    const tileX = Math.floor(pointer.x / TILE_SIZE);
    const tileY = Math.floor(pointer.y / TILE_SIZE);
    
    if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
      if (map[tileY][tileX] === 0) {
        findPath(gameState.playerX, gameState.playerY, tileX, tileY);
      }
    }
  });
  
  // 状态文本
  statusText = this.add.text(10, 510, '', {
    fontSize: '18px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();
}

function update(time, delta) {
  if (isMoving && path.length > 0) {
    const target = path[pathIndex];
    const targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
    const targetY = target.y * TILE_SIZE + TILE_SIZE / 2;
    
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 2) {
      player.x = targetX;
      player.y = targetY;
      gameState.playerX = target.x;
      gameState.playerY = target.y;
      
      pathIndex++;
      if (pathIndex >= path.length) {
        isMoving = false;
        path = [];
        pathIndex = 0;
        gameState.moveCount++;
        updateStatusText();
        clearPathVisualization();
      }
    } else {
      const speed = 200;
      player.x += (dx / distance) * speed * (delta / 1000);
      player.y += (dy / distance) * speed * (delta / 1000);
    }
  }
}

function initializeMap() {
  map = [];
  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // 保证起点(0,0)不是障碍
      if (x === 0 && y === 0) {
        map[y][x] = 0;
      } else {
        map[y][x] = Math.random() < OBSTACLE_RATE ? 1 : 0;
      }
    }
  }
}

function renderMap(scene) {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const texture = map[y][x] === 1 ? 'obstacle' : 'ground';
      scene.add.image(
        x * TILE_SIZE + TILE_SIZE / 2,
        y * TILE_SIZE + TILE_SIZE / 2,
        texture
      );
    }
  }
}

function findPath(startX, startY, endX, endY) {
  // A* 寻路算法
  const openList = [];
  const closedList = new Set();
  const cameFrom = new Map();
  
  const start = { x: startX, y: startY, g: 0, h: 0, f: 0 };
  openList.push(start);
  
  while (openList.length > 0) {
    // 找到 f 值最小的节点
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    
    if (current.x === endX && current.y === endY) {
      // 找到路径，重建路径
      reconstructPath(cameFrom, current);
      return;
    }
    
    closedList.add(`${current.x},${current.y}`);
    
    // 检查四个方向的邻居
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      if (neighbor.x < 0 || neighbor.x >= MAP_WIDTH || 
          neighbor.y < 0 || neighbor.y >= MAP_HEIGHT) {
        continue;
      }
      
      if (map[neighbor.y][neighbor.x] === 1) {
        continue;
      }
      
      const key = `${neighbor.x},${neighbor.y}`;
      if (closedList.has(key)) {
        continue;
      }
      
      const g = current.g + 1;
      const h = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
      const f = g + h;
      
      const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          cameFrom.set(key, current);
        }
      } else {
        openList.push({ x: neighbor.x, y: neighbor.y, g, h, f });
        cameFrom.set(key, current);
      }
    }
  }
  
  // 没有找到路径
  console.log('No path found');
}

function reconstructPath(cameFrom, current) {
  path = [current];
  let key = `${current.x},${current.y}`;
  
  while (cameFrom.has(key)) {
    current = cameFrom.get(key);
    path.unshift(current);
    key = `${current.x},${current.y}`;
  }
  
  // 移除起点
  path.shift();
  
  if (path.length > 0) {
    gameState.pathLength = path.length;
    pathIndex = 0;
    isMoving = true;
    visualizePath();
  }
}

function visualizePath() {
  clearPathVisualization();
  graphics.lineStyle(3, 0xFFEB3B, 0.8);
  
  if (path.length > 0) {
    graphics.beginPath();
    graphics.moveTo(
      gameState.playerX * TILE_SIZE + TILE_SIZE / 2,
      gameState.playerY * TILE_SIZE + TILE_SIZE / 2
    );
    
    for (const point of path) {
      graphics.lineTo(
        point.x * TILE_SIZE + TILE_SIZE / 2,
        point.y * TILE_SIZE + TILE_SIZE / 2
      );
    }
    
    graphics.strokePath();
  }
}

function clearPathVisualization() {
  graphics.clear();
}

function updateStatusText() {
  statusText.setText(
    `位置: (${gameState.playerX}, ${gameState.playerY}) | ` +
    `移动次数: ${gameState.moveCount} | ` +
    `路径长度: ${gameState.pathLength}`
  );
}

new Phaser.Game(config);