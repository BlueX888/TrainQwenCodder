// 完整的 Phaser3 寻路游戏代码
const GRID_SIZE = 5;
const TILE_SIZE = 80;
const OBSTACLE_RATE = 0.3;

// 全局信号对象
window.__signals__ = {
  mapGenerated: false,
  playerPosition: { x: 0, y: 0 },
  moveCount: 0,
  obstacleCount: 0,
  pathFound: false,
  gameReady: false
};

class PathfindingScene extends Phaser.Scene {
  constructor() {
    super('PathfindingScene');
    this.grid = [];
    this.player = null;
    this.playerGridPos = { x: 0, y: 0 };
    this.isMoving = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 生成地图
    this.generateMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 设置输入
    this.input.on('pointerdown', this.handleClick, this);
    
    // 添加说明文字
    this.add.text(10, GRID_SIZE * TILE_SIZE + 10, 'Click to move player', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    
    this.add.text(10, GRID_SIZE * TILE_SIZE + 35, 'Moves: 0', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setName('moveText');
    
    // 更新信号
    window.__signals__.gameReady = true;
    console.log('[SIGNAL]', JSON.stringify(window.__signals__));
  }

  createTextures() {
    // 地面纹理（浅灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0xcccccc, 1);
    groundGraphics.fillRect(0, 0, TILE_SIZE - 2, TILE_SIZE - 2);
    groundGraphics.lineStyle(2, 0x999999, 1);
    groundGraphics.strokeRect(0, 0, TILE_SIZE - 2, TILE_SIZE - 2);
    groundGraphics.generateTexture('ground', TILE_SIZE, TILE_SIZE);
    groundGraphics.destroy();

    // 障碍物纹理（深灰色）
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0x333333, 1);
    obstacleGraphics.fillRect(0, 0, TILE_SIZE - 2, TILE_SIZE - 2);
    obstacleGraphics.lineStyle(2, 0x000000, 1);
    obstacleGraphics.strokeRect(0, 0, TILE_SIZE - 2, TILE_SIZE - 2);
    obstacleGraphics.generateTexture('obstacle', TILE_SIZE, TILE_SIZE);
    obstacleGraphics.destroy();

    // 玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
    playerGraphics.lineStyle(3, 0xffffff, 1);
    playerGraphics.strokeCircle(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 3);
    playerGraphics.generateTexture('player', TILE_SIZE, TILE_SIZE);
    playerGraphics.destroy();

    // 路径标记纹理（黄色）
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xffff00, 0.5);
    pathGraphics.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, 8);
    pathGraphics.generateTexture('pathMarker', TILE_SIZE, TILE_SIZE);
    pathGraphics.destroy();
  }

  generateMap() {
    // 初始化网格
    for (let y = 0; y < GRID_SIZE; y++) {
      this.grid[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        this.grid[y][x] = {
          walkable: true,
          sprite: null
        };
      }
    }

    // 随机生成障碍物
    let obstacleCount = 0;
    const targetObstacles = Math.floor(GRID_SIZE * GRID_SIZE * OBSTACLE_RATE);
    
    while (obstacleCount < targetObstacles) {
      const x = Phaser.Math.Between(0, GRID_SIZE - 1);
      const y = Phaser.Math.Between(0, GRID_SIZE - 1);
      
      // 确保起点(0,0)不是障碍物
      if (x === 0 && y === 0) continue;
      
      if (this.grid[y][x].walkable) {
        this.grid[y][x].walkable = false;
        obstacleCount++;
      }
    }

    // 渲染地图
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const posX = x * TILE_SIZE;
        const posY = y * TILE_SIZE;
        
        if (this.grid[y][x].walkable) {
          this.add.image(posX, posY, 'ground').setOrigin(0);
        } else {
          this.add.image(posX, posY, 'obstacle').setOrigin(0);
        }
      }
    }

    // 更新信号
    window.__signals__.mapGenerated = true;
    window.__signals__.obstacleCount = obstacleCount;
    console.log('[SIGNAL]', JSON.stringify(window.__signals__));
  }

  createPlayer() {
    this.playerGridPos = { x: 0, y: 0 };
    this.player = this.add.image(
      this.playerGridPos.x * TILE_SIZE + TILE_SIZE / 2,
      this.playerGridPos.y * TILE_SIZE + TILE_SIZE / 2,
      'player'
    );
    
    window.__signals__.playerPosition = { ...this.playerGridPos };
    console.log('[SIGNAL]', JSON.stringify(window.__signals__));
  }

  handleClick(pointer) {
    if (this.isMoving) return;

    const gridX = Math.floor(pointer.x / TILE_SIZE);
    const gridY = Math.floor(pointer.y / TILE_SIZE);

    // 检查点击是否在网格内
    if (gridX < 0 || gridX >= GRID_SIZE || gridY < 0 || gridY >= GRID_SIZE) {
      return;
    }

    // 检查目标是否可走
    if (!this.grid[gridY][gridX].walkable) {
      console.log('[INFO] Target is obstacle');
      return;
    }

    // 寻路
    const path = this.findPath(
      this.playerGridPos.x,
      this.playerGridPos.y,
      gridX,
      gridY
    );

    if (path && path.length > 0) {
      window.__signals__.pathFound = true;
      console.log('[INFO] Path found, length:', path.length);
      this.moveAlongPath(path);
    } else {
      window.__signals__.pathFound = false;
      console.log('[INFO] No path found');
    }
  }

  findPath(startX, startY, endX, endY) {
    // A* 寻路算法实现
    const openList = [];
    const closedList = [];
    const cameFrom = {};

    const start = { x: startX, y: startY, g: 0, h: 0, f: 0 };
    openList.push(start);

    const key = (x, y) => `${x},${y}`;
    const heuristic = (x, y) => Math.abs(x - endX) + Math.abs(y - endY);

    while (openList.length > 0) {
      // 找到 f 值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();

      // 到达终点
      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(cameFrom, current);
      }

      closedList.push(key(current.x, current.y));

      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        const { x, y } = neighbor;

        // 检查边界和可走性
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) continue;
        if (!this.grid[y][x].walkable) continue;
        if (closedList.includes(key(x, y))) continue;

        const g = current.g + 1;
        const h = heuristic(x, y);
        const f = g + h;

        const existingNode = openList.find(n => n.x === x && n.y === y);
        
        if (!existingNode) {
          openList.push({ x, y, g, h, f });
          cameFrom[key(x, y)] = current;
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          cameFrom[key(x, y)] = current;
        }
      }
    }

    return null; // 没有找到路径
  }

  reconstructPath(cameFrom, current) {
    const path = [{ x: current.x, y: current.y }];
    const key = (x, y) => `${x},${y}`;

    while (cameFrom[key(current.x, current.y)]) {
      current = cameFrom[key(current.x, current.y)];
      path.unshift({ x: current.x, y: current.y });
    }

    return path.slice(1); // 移除起点
  }

  moveAlongPath(path) {
    this.isMoving = true;
    let index = 0;

    const moveNext = () => {
      if (index >= path.length) {
        this.isMoving = false;
        return;
      }

      const target = path[index];
      this.playerGridPos = { x: target.x, y: target.y };

      this.tweens.add({
        targets: this.player,
        x: target.x * TILE_SIZE + TILE_SIZE / 2,
        y: target.y * TILE_SIZE + TILE_SIZE / 2,
        duration: 200,
        onComplete: () => {
          index++;
          window.__signals__.moveCount++;
          window.__signals__.playerPosition = { ...this.playerGridPos };
          
          const moveText = this.children.getByName('moveText');
          if (moveText) {
            moveText.setText(`Moves: ${window.__signals__.moveCount}`);
          }
          
          console.log('[SIGNAL]', JSON.stringify(window.__signals__));
          moveNext();
        }
      });
    };

    moveNext();
  }
}

const config = {
  type: Phaser.AUTO,
  width: GRID_SIZE * TILE_SIZE,
  height: GRID_SIZE * TILE_SIZE + 70,
  backgroundColor: '#222222',
  scene: PathfindingScene
};

new Phaser.Game(config);