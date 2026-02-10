const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 全局状态信号
let gameState = {
  moveCount: 0,
  playerX: 0,
  playerY: 0,
  isMoving: false,
  pathLength: 0
};

// 地图配置
const TILE_SIZE = 64;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;
const OBSTACLE_DENSITY = 0.3;

let tilemap;
let layer;
let player;
let path = [];
let currentPathIndex = 0;

function preload() {
  // 使用 Graphics 创建纹理，不依赖外部资源
}

function create() {
  // 创建地板纹理
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0x8B7355, 1);
  floorGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.lineStyle(2, 0x654321, 1);
  floorGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
  floorGraphics.destroy();

  // 创建障碍物纹理
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x333333, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.fillStyle(0x555555, 1);
  wallGraphics.fillRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
  wallGraphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();

  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.fillStyle(0xffffff, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2 - 8, TILE_SIZE / 2 - 5, 4);
  playerGraphics.fillCircle(TILE_SIZE / 2 + 8, TILE_SIZE / 2 - 5, 4);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();

  // 创建 tilemap 数据
  const mapData = generateMapData();
  
  // 创建 tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });

  // 添加 tileset（使用我们创建的纹理）
  const tiles = map.addTilesetImage('floor', null, TILE_SIZE, TILE_SIZE);
  
  // 创建图层
  layer = map.createLayer(0, tiles, 50, 50);
  
  // 渲染地图（手动绘制，因为 tilemap 纹理限制）
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      const tileX = 50 + x * TILE_SIZE;
      const tileY = 50 + y * TILE_SIZE;
      
      if (mapData[y][x] === 1) {
        this.add.image(tileX, tileY, 'wall').setOrigin(0);
      } else {
        this.add.image(tileX, tileY, 'floor').setOrigin(0);
      }
    }
  }

  // 创建玩家
  player = this.add.image(50, 50, 'player').setOrigin(0);
  gameState.playerX = 0;
  gameState.playerY = 0;

  // 添加点击事件
  this.input.on('pointerdown', (pointer) => {
    if (gameState.isMoving) return;

    const tileX = Math.floor((pointer.x - 50) / TILE_SIZE);
    const tileY = Math.floor((pointer.y - 50) / TILE_SIZE);

    if (tileX >= 0 && tileX < MAP_WIDTH && tileY >= 0 && tileY < MAP_HEIGHT) {
      if (mapData[tileY][tileX] === 0) {
        // 寻路
        path = findPath(
          mapData,
          { x: gameState.playerX, y: gameState.playerY },
          { x: tileX, y: tileY }
        );
        
        if (path.length > 0) {
          currentPathIndex = 0;
          gameState.isMoving = true;
          gameState.pathLength = path.length;
        }
      }
    }
  });

  // 显示状态信息
  this.add.text(50, 10, 'Click to move player', {
    fontSize: '20px',
    fill: '#fff'
  });

  const statusText = this.add.text(500, 10, '', {
    fontSize: '16px',
    fill: '#fff'
  });

  // 更新状态显示
  this.events.on('update', () => {
    statusText.setText(
      `Moves: ${gameState.moveCount}\n` +
      `Position: (${gameState.playerX}, ${gameState.playerY})\n` +
      `Moving: ${gameState.isMoving}`
    );
  });
}

function update(time, delta) {
  if (gameState.isMoving && path.length > 0) {
    if (currentPathIndex < path.length) {
      const target = path[currentPathIndex];
      const targetX = 50 + target.x * TILE_SIZE;
      const targetY = 50 + target.y * TILE_SIZE;

      // 平滑移动
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 2) {
        player.x = targetX;
        player.y = targetY;
        gameState.playerX = target.x;
        gameState.playerY = target.y;
        currentPathIndex++;
        gameState.moveCount++;
      } else {
        const speed = 200 * (delta / 1000);
        player.x += (dx / distance) * speed;
        player.y += (dy / distance) * speed;
      }
    } else {
      gameState.isMoving = false;
      path = [];
    }
  }
}

// 生成地图数据（0=地板，1=障碍）
function generateMapData() {
  const data = [];
  
  for (let y = 0; y < MAP_HEIGHT; y++) {
    data[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // 起点(0,0)和周围保持空白
      if ((x === 0 && y === 0) || (x === 1 && y === 0) || (x === 0 && y === 1)) {
        data[y][x] = 0;
      } else {
        data[y][x] = Math.random() < OBSTACLE_DENSITY ? 1 : 0;
      }
    }
  }
  
  return data;
}

// A* 寻路算法
function findPath(grid, start, end) {
  const openList = [];
  const closedList = [];
  const startNode = { ...start, g: 0, h: 0, f: 0, parent: null };
  
  openList.push(startNode);

  while (openList.length > 0) {
    // 找到 f 值最小的节点
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }

    const current = openList[currentIndex];

    // 到达目标
    if (current.x === end.x && current.y === end.y) {
      const path = [];
      let temp = current;
      while (temp.parent) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path;
    }

    openList.splice(currentIndex, 1);
    closedList.push(current);

    // 检查相邻节点
    const neighbors = [
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 }
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.x < 0 || neighbor.x >= MAP_WIDTH ||
        neighbor.y < 0 || neighbor.y >= MAP_HEIGHT ||
        grid[neighbor.y][neighbor.x] === 1
      ) {
        continue;
      }

      if (closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
        continue;
      }

      const g = current.g + 1;
      const h = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
      const f = g + h;

      const existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
      
      if (!existing) {
        openList.push({ ...neighbor, g, h, f, parent: current });
      } else if (g < existing.g) {
        existing.g = g;
        existing.f = f;
        existing.parent = current;
      }
    }
  }

  return []; // 无路径
}

new Phaser.Game(config);