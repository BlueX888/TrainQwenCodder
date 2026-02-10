// 完整的 Phaser3 地图寻路游戏
const GRID_SIZE = 10;
const TILE_SIZE = 60;
const OBSTACLE_RATE = 0.3;

class PathfindingScene extends Phaser.Scene {
  constructor() {
    super('PathfindingScene');
    this.mapData = [];
    this.player = null;
    this.playerGridX = 0;
    this.playerGridY = 0;
    this.moveCount = 0; // 状态信号：移动次数
    this.isMoving = false;
    this.path = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 生成随机地图数据
    this.generateMap();
    
    // 绘制地图
    this.drawMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 添加点击事件
    this.input.on('pointerdown', this.handleClick, this);
    
    // 显示移动次数
    this.moveText = this.add.text(10, 10, 'Moves: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示说明
    this.add.text(10, 50, 'Click to move player', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  generateMap() {
    // 初始化全部为可行走地面
    for (let y = 0; y < GRID_SIZE; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        this.mapData[y][x] = 0; // 0 = 地面, 1 = 障碍
      }
    }
    
    // 随机放置障碍物（约30%）
    const totalTiles = GRID_SIZE * GRID_SIZE;
    const obstacleCount = Math.floor(totalTiles * OBSTACLE_RATE);
    let placed = 0;
    
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, GRID_SIZE - 1);
      const y = Phaser.Math.Between(0, GRID_SIZE - 1);
      
      // 确保起始位置(0,0)可行走
      if ((x === 0 && y === 0) || this.mapData[y][x] === 1) {
        continue;
      }
      
      this.mapData[y][x] = 1;
      placed++;
    }
  }

  drawMap() {
    const graphics = this.add.graphics();
    
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const posX = x * TILE_SIZE;
        const posY = y * TILE_SIZE;
        
        if (this.mapData[y][x] === 1) {
          // 障碍物 - 灰色
          graphics.fillStyle(0x666666, 1);
        } else {
          // 地面 - 绿色
          graphics.fillStyle(0x44aa44, 1);
        }
        
        graphics.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        
        // 绘制网格线
        graphics.lineStyle(2, 0x333333, 1);
        graphics.strokeRect(posX, posY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  createPlayer() {
    // 找到第一个可行走的位置
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (this.mapData[y][x] === 0) {
          this.playerGridX = x;
          this.playerGridY = y;
          
          // 创建玩家纹理
          const graphics = this.make.graphics({ x: 0, y: 0, add: false });
          graphics.fillStyle(0x3366ff, 1);
          graphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 2 - 5);
          graphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
          graphics.destroy();
          
          // 创建玩家精灵
          this.player = this.add.sprite(
            x * TILE_SIZE + TILE_SIZE / 2,
            y * TILE_SIZE + TILE_SIZE / 2,
            'player'
          );
          return;
        }
      }
    }
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    const gridX = Math.floor(pointer.x / TILE_SIZE);
    const gridY = Math.floor(pointer.y / TILE_SIZE);
    
    // 检查点击位置是否有效
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
      return;
    }
    
    if (this.mapData[gridY][gridX] === 1) {
      console.log('Cannot move to obstacle');
      return;
    }
    
    // 寻路
    const path = this.findPath(
      this.playerGridX, this.playerGridY,
      gridX, gridY
    );
    
    if (path && path.length > 0) {
      this.moveAlongPath(path);
    } else {
      console.log('No path found');
    }
  }

  findPath(startX, startY, endX, endY) {
    // A* 寻路算法
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = `${startX},${startY}`;
    const endKey = `${endX},${endY}`;
    
    openList.push({ x: startX, y: startY });
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startX, startY, endX, endY));
    
    while (openList.length > 0) {
      // 找到 fScore 最小的节点
      openList.sort((a, b) => {
        const aKey = `${a.x},${a.y}`;
        const bKey = `${b.x},${b.y}`;
        return fScore.get(aKey) - fScore.get(bKey);
      });
      
      const current = openList.shift();
      const currentKey = `${current.x},${current.y}`;
      
      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(cameFrom, currentKey);
      }
      
      closedList.add(currentKey);
      
      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        // 检查是否越界或是障碍物
        if (neighbor.x < 0 || neighbor.x >= GRID_SIZE ||
            neighbor.y < 0 || neighbor.y >= GRID_SIZE ||
            this.mapData[neighbor.y][neighbor.x] === 1) {
          continue;
        }
        
        if (closedList.has(neighborKey)) {
          continue;
        }
        
        const tentativeGScore = gScore.get(currentKey) + 1;
        
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, currentKey);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor.x, neighbor.y, endX, endY));
          
          if (!openList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
            openList.push(neighbor);
          }
        }
      }
    }
    
    return null; // 没有找到路径
  }

  heuristic(x1, y1, x2, y2) {
    // 曼哈顿距离
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  reconstructPath(cameFrom, currentKey) {
    const path = [];
    let current = currentKey;
    
    while (cameFrom.has(current)) {
      const [x, y] = current.split(',').map(Number);
      path.unshift({ x, y });
      current = cameFrom.get(current);
    }
    
    return path;
  }

  moveAlongPath(path) {
    if (path.length === 0) return;
    
    this.isMoving = true;
    this.path = path;
    this.moveToNextPoint();
  }

  moveToNextPoint() {
    if (this.path.length === 0) {
      this.isMoving = false;
      return;
    }
    
    const next = this.path.shift();
    this.playerGridX = next.x;
    this.playerGridY = next.y;
    
    // 移动动画
    this.tweens.add({
      targets: this.player,
      x: next.x * TILE_SIZE + TILE_SIZE / 2,
      y: next.y * TILE_SIZE + TILE_SIZE / 2,
      duration: 200,
      onComplete: () => {
        this.moveCount++;
        this.moveText.setText(`Moves: ${this.moveCount}`);
        this.moveToNextPoint();
      }
    });
  }

  update(time, delta) {
    // 游戏循环（当前不需要持续更新）
  }
}

const config = {
  type: Phaser.AUTO,
  width: GRID_SIZE * TILE_SIZE,
  height: GRID_SIZE * TILE_SIZE,
  backgroundColor: '#222222',
  scene: PathfindingScene
};

new Phaser.Game(config);