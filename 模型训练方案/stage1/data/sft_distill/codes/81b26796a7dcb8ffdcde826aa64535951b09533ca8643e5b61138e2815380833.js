const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  moveCount: 0,
  obstacleCount: 0,
  pathLength: 0,
  isMoving: false
};

const TILE_SIZE = 50;
const MAP_SIZE = 12;
const OBSTACLE_DENSITY = 0.3;

let map = [];
let player;
let playerTileX = 0;
let playerTileY = 0;
let graphics;
let pathGraphics;
let isMoving = false;
let currentPath = [];
let moveSpeed = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  graphics = this.add.graphics();
  pathGraphics = this.add.graphics();
  
  // 初始化地图数组
  initializeMap();
  
  // 生成纹理
  createTextures.call(this);
  
  // 绘制地图
  drawMap.call(this);
  
  // 创建玩家
  createPlayer.call(this);
  
  // 添加点击事件
  this.input.on('pointerdown', handleClick.bind(this));
  
  // 输出初始信号
  updateSignals();
  console.log('Initial signals:', JSON.stringify(window.__signals__));
}

function update(time, delta) {
  if (isMoving && currentPath.length > 0) {
    movePlayerAlongPath(delta);
  }
}

function initializeMap() {
  // 创建空地图
  for (let y = 0; y < MAP_SIZE; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_SIZE; x++) {
      map[y][x] = 0; // 0 = 可通行
    }
  }
  
  // 随机生成障碍
  let obstacleCount = 0;
  const targetObstacles = Math.floor(MAP_SIZE * MAP_SIZE * OBSTACLE_DENSITY);
  
  while (obstacleCount < targetObstacles) {
    const x = Phaser.Math.Between(0, MAP_SIZE - 1);
    const y = Phaser.Math.Between(0, MAP_SIZE - 1);
    
    // 确保起始位置(0,0)不是障碍
    if ((x === 0 && y === 0) || map[y][x] === 1) {
      continue;
    }
    
    map[y][x] = 1; // 1 = 障碍
    obstacleCount++;
  }
  
  window.__signals__.obstacleCount = obstacleCount;
}

function createTextures() {
  // 创建地板纹理
  const floorGraphics = this.add.graphics();
  floorGraphics.fillStyle(0x8b7355, 1);
  floorGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.lineStyle(2, 0x6b5345, 1);
  floorGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  floorGraphics.generateTexture('floor', TILE_SIZE, TILE_SIZE);
  floorGraphics.destroy();
  
  // 创建墙壁纹理
  const wallGraphics = this.add.graphics();
  wallGraphics.fillStyle(0x4a4a4a, 1);
  wallGraphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.lineStyle(2, 0x2a2a2a, 1);
  wallGraphics.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
  wallGraphics.generateTexture('wall', TILE_SIZE, TILE_SIZE);
  wallGraphics.destroy();
  
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.lineStyle(3, 0x00aa00, 1);
  playerGraphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
  playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
  playerGraphics.destroy();
}

function drawMap() {
  for (let y = 0; y < MAP_SIZE; y++) {
    for (let x = 0; x < MAP_SIZE; x++) {
      const texture = map[y][x] === 1 ? 'wall' : 'floor';
      this.add.image(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, texture);
    }
  }
}

function createPlayer() {
  player = this.add.image(
    playerTileX * TILE_SIZE + TILE_SIZE / 2,
    playerTileY * TILE_SIZE + TILE_SIZE / 2,
    'player'
  );
  player.setDepth(10);
}

function handleClick(pointer) {
  if (isMoving) return;
  
  const clickTileX = Math.floor(pointer.x / TILE_SIZE);
  const clickTileY = Math.floor(pointer.y / TILE_SIZE);
  
  // 检查点击是否在地图范围内
  if (clickTileX < 0 || clickTileX >= MAP_SIZE || clickTileY < 0 || clickTileY >= MAP_SIZE) {
    return;
  }
  
  // 检查目标是否可通行
  if (map[clickTileY][clickTileX] === 1) {
    console.log('Cannot move to obstacle');
    return;
  }
  
  // 寻路
  const path = findPath(playerTileX, playerTileY, clickTileX, clickTileY);
  
  if (path && path.length > 0) {
    currentPath = path;
    window.__signals__.pathLength = path.length;
    window.__signals__.isMoving = true;
    isMoving = true;
    drawPath(path);
    console.log('Path found:', JSON.stringify({ length: path.length, target: { x: clickTileX, y: clickTileY } }));
  } else {
    console.log('No path found');
  }
}

function findPath(startX, startY, endX, endY) {
  // A* 寻路算法
  const openList = [];
  const closedList = new Set();
  
  const startNode = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  
  openList.push(startNode);
  
  while (openList.length > 0) {
    // 找到 f 值最小的节点
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    
    // 到达目标
    if (current.x === endX && current.y === endY) {
      return reconstructPath(current);
    }
    
    closedList.add(`${current.x},${current.y}`);
    
    // 检查相邻节点（上下左右）
    const neighbors = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 }
    ];
    
    for (const neighbor of neighbors) {
      const { x, y } = neighbor;
      
      // 检查边界和障碍
      if (x < 0 || x >= MAP_SIZE || y < 0 || y >= MAP_SIZE || map[y][x] === 1) {
        continue;
      }
      
      if (closedList.has(`${x},${y}`)) {
        continue;
      }
      
      const g = current.g + 1;
      const h = heuristic(x, y, endX, endY);
      const f = g + h;
      
      // 检查是否已在 openList 中
      const existingNode = openList.find(node => node.x === x && node.y === y);
      
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openList.push({ x, y, g, h, f, parent: current });
      }
    }
  }
  
  return null; // 没有找到路径
}

function heuristic(x1, y1, x2, y2) {
  // 曼哈顿距离
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function reconstructPath(node) {
  const path = [];
  let current = node;
  
  while (current.parent !== null) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  
  return path;
}

function drawPath(path) {
  pathGraphics.clear();
  pathGraphics.lineStyle(4, 0xffff00, 0.6);
  
  pathGraphics.beginPath();
  pathGraphics.moveTo(
    playerTileX * TILE_SIZE + TILE_SIZE / 2,
    playerTileY * TILE_SIZE + TILE_SIZE / 2
  );
  
  for (const point of path) {
    pathGraphics.lineTo(
      point.x * TILE_SIZE + TILE_SIZE / 2,
      point.y * TILE_SIZE + TILE_SIZE / 2
    );
  }
  
  pathGraphics.strokePath();
}

function movePlayerAlongPath(delta) {
  if (currentPath.length === 0) {
    isMoving = false;
    window.__signals__.isMoving = false;
    pathGraphics.clear();
    updateSignals();
    console.log('Movement complete:', JSON.stringify(window.__signals__));
    return;
  }
  
  const target = currentPath[0];
  const targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
  const targetY = target.y * TILE_SIZE + TILE_SIZE / 2;
  
  const distance = Phaser.Math.Distance.Between(player.x, player.y, targetX, targetY);
  const moveDistance = (moveSpeed * delta) / 1000;
  
  if (distance <= moveDistance) {
    // 到达当前目标点
    player.x = targetX;
    player.y = targetY;
    playerTileX = target.x;
    playerTileY = target.y;
    currentPath.shift();
    window.__signals__.moveCount++;
  } else {
    // 继续移动
    const angle = Phaser.Math.Angle.Between(player.x, player.y, targetX, targetY);
    player.x += Math.cos(angle) * moveDistance;
    player.y += Math.sin(angle) * moveDistance;
  }
}

function updateSignals() {
  window.__signals__.playerX = playerTileX;
  window.__signals__.playerY = playerTileY;
}

new Phaser.Game(config);