const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态
let gameState = {
  moveCount: 0,
  playerX: 0,
  playerY: 0,
  pathLength: 0
};

// 地图数据
const GRID_SIZE = 3;
const TILE_SIZE = 150;
let mapData = [];
let player;
let graphics;
let isMoving = false;
let currentPath = [];
let pathIndex = 0;

function preload() {
  // 不需要加载外部资源
}

function create() {
  graphics = this.add.graphics();
  
  // 生成随机地图（30%障碍）
  generateMap();
  
  // 绘制地图
  drawMap();
  
  // 创建玩家（使用Graphics绘制）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillCircle(0, 0, TILE_SIZE * 0.3);
  playerGraphics.generateTexture('player', TILE_SIZE * 0.6, TILE_SIZE * 0.6);
  playerGraphics.destroy();
  
  player = this.add.sprite(
    TILE_SIZE / 2,
    TILE_SIZE / 2,
    'player'
  );
  
  // 初始化玩家位置
  gameState.playerX = 0;
  gameState.playerY = 0;
  
  // 监听点击事件
  this.input.on('pointerdown', (pointer) => {
    if (!isMoving) {
      handleClick(pointer.x, pointer.y);
    }
  });
  
  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText.call(this);
}

function update(time, delta) {
  // 执行路径移动
  if (isMoving && currentPath.length > 0) {
    const target = currentPath[pathIndex];
    const targetX = target.x * TILE_SIZE + TILE_SIZE / 2;
    const targetY = target.y * TILE_SIZE + TILE_SIZE / 2;
    
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 3) {
      // 到达当前路径点
      player.x = targetX;
      player.y = targetY;
      gameState.playerX = target.x;
      gameState.playerY = target.y;
      
      pathIndex++;
      if (pathIndex >= currentPath.length) {
        // 路径完成
        isMoving = false;
        currentPath = [];
        pathIndex = 0;
        gameState.moveCount++;
        updateStatusText.call(this);
      }
    } else {
      // 移动向目标
      const speed = 200 * (delta / 1000);
      player.x += (dx / distance) * speed;
      player.y += (dy / distance) * speed;
    }
  }
}

function generateMap() {
  mapData = [];
  
  // 初始化地图
  for (let y = 0; y < GRID_SIZE; y++) {
    mapData[y] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      mapData[y][x] = 0; // 0 = 可通行
    }
  }
  
  // 确保起点可通行
  mapData[0][0] = 0;
  
  // 随机生成障碍（30%密度）
  const totalTiles = GRID_SIZE * GRID_SIZE;
  const obstacleCount = Math.floor(totalTiles * 0.3);
  let placed = 0;
  
  while (placed < obstacleCount) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    
    // 不在起点放置障碍
    if ((x !== 0 || y !== 0) && mapData[y][x] === 0) {
      mapData[y][x] = 1; // 1 = 障碍
      placed++;
    }
  }
}

function drawMap() {
  graphics.clear();
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;
      
      if (mapData[y][x] === 1) {
        // 障碍物 - 深灰色
        graphics.fillStyle(0x444444, 1);
        graphics.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
      } else {
        // 地板 - 浅灰色
        graphics.fillStyle(0x888888, 1);
        graphics.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
      }
      
      // 绘制网格线
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeRect(posX, posY, TILE_SIZE, TILE_SIZE);
    }
  }
}

function handleClick(x, y) {
  const gridX = Math.floor(x / TILE_SIZE);
  const gridY = Math.floor(y / TILE_SIZE);
  
  // 检查点击位置是否有效
  if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
    return;
  }
  
  if (mapData[gridY][gridX] === 1) {
    console.log('目标位置是障碍物');
    return;
  }
  
  // 使用A*寻路
  const path = findPath(
    { x: gameState.playerX, y: gameState.playerY },
    { x: gridX, y: gridY }
  );
  
  if (path && path.length > 0) {
    currentPath = path;
    pathIndex = 0;
    isMoving = true;
    gameState.pathLength = path.length;
    
    // 绘制路径预览
    drawPath(path);
  } else {
    console.log('无法到达目标位置');
  }
}

function findPath(start, end) {
  // A* 寻路算法
  const openList = [];
  const closedList = [];
  
  const startNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: 0,
    parent: null
  };
  startNode.f = startNode.g + startNode.h;
  
  openList.push(startNode);
  
  while (openList.length > 0) {
    // 找到f值最小的节点
    let currentIndex = 0;
    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < openList[currentIndex].f) {
        currentIndex = i;
      }
    }
    
    const current = openList[currentIndex];
    
    // 到达目标
    if (current.x === end.x && current.y === end.y) {
      return reconstructPath(current);
    }
    
    // 从开放列表移除，加入关闭列表
    openList.splice(currentIndex, 1);
    closedList.push(current);
    
    // 检查相邻节点
    const neighbors = getNeighbors(current);
    for (const neighbor of neighbors) {
      // 检查是否在关闭列表
      if (closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
        continue;
      }
      
      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;
      
      // 检查是否在开放列表
      const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openList.push({
          x: neighbor.x,
          y: neighbor.y,
          g: g,
          h: h,
          f: f,
          parent: current
        });
      }
    }
  }
  
  return null; // 无路径
}

function heuristic(a, b) {
  // 曼哈顿距离
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(node) {
  const neighbors = [];
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 1, y: 0 },  // 右
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }  // 左
  ];
  
  for (const dir of directions) {
    const x = node.x + dir.x;
    const y = node.y + dir.y;
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && mapData[y][x] === 0) {
      neighbors.push({ x, y });
    }
  }
  
  return neighbors;
}

function reconstructPath(node) {
  const path = [];
  let current = node;
  
  while (current.parent) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  
  return path;
}

function drawPath(path) {
  // 重绘地图
  drawMap();
  
  // 绘制路径
  graphics.lineStyle(4, 0x00ffff, 0.8);
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

function updateStatusText() {
  this.statusText.setText(
    `移动次数: ${gameState.moveCount}\n` +
    `当前位置: (${gameState.playerX}, ${gameState.playerY})\n` +
    `路径长度: ${gameState.pathLength}`
  );
}

new Phaser.Game(config);