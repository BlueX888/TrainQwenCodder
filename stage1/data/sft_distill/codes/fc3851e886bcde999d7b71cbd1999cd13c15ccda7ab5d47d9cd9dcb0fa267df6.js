// 5x5 随机障碍地图 + A* 寻路
class PathfindingScene extends Phaser.Scene {
  constructor() {
    super('PathfindingScene');
    this.mapSize = 5;
    this.tileSize = 80;
    this.mapData = [];
    this.playerPos = { x: 0, y: 0 };
    this.moveCount = 0;
    this.isMoving = false;
  }

  preload() {
    // 无需外部资源
  }

  create() {
    // 初始化 signals
    window.__signals__ = {
      playerX: 0,
      playerY: 0,
      moveCount: 0,
      mapGenerated: false,
      pathFound: false
    };

    // 生成随机地图数据（0=可走，1=障碍）
    this.generateMap();

    // 创建纹理
    this.createTextures();

    // 绘制地图
    this.drawMap();

    // 创建玩家
    this.createPlayer();

    // 监听点击事件
    this.input.on('pointerdown', (pointer) => {
      if (this.isMoving) return;

      const targetX = Math.floor(pointer.x / this.tileSize);
      const targetY = Math.floor(pointer.y / this.tileSize);

      if (targetX >= 0 && targetX < this.mapSize && 
          targetY >= 0 && targetY < this.mapSize) {
        this.movePlayerTo(targetX, targetY);
      }
    });

    // 添加提示文本
    this.add.text(10, 410, 'Click to move player (A* pathfinding)', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.add.text(10, 430, 'Green=Player, Red=Obstacle, White=Ground', {
      fontSize: '14px',
      fill: '#cccccc'
    });

    window.__signals__.mapGenerated = true;
    console.log('Map generated:', JSON.stringify(this.mapData));
  }

  generateMap() {
    // 生成 5x5 地图，30% 障碍密度
    for (let y = 0; y < this.mapSize; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        // 起点不放障碍
        if (x === 0 && y === 0) {
          this.mapData[y][x] = 0;
        } else {
          this.mapData[y][x] = Math.random() < 0.3 ? 1 : 0;
        }
      }
    }
  }

  createTextures() {
    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0xeeeeee, 1);
    groundGraphics.fillRect(0, 0, this.tileSize - 2, this.tileSize - 2);
    groundGraphics.lineStyle(2, 0xcccccc, 1);
    groundGraphics.strokeRect(0, 0, this.tileSize - 2, this.tileSize - 2);
    groundGraphics.generateTexture('ground', this.tileSize, this.tileSize);
    groundGraphics.destroy();

    // 创建障碍纹理
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0xff3333, 1);
    obstacleGraphics.fillRect(5, 5, this.tileSize - 12, this.tileSize - 12);
    obstacleGraphics.generateTexture('obstacle', this.tileSize, this.tileSize);
    obstacleGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();
  }

  drawMap() {
    this.tiles = [];
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const tile = this.add.image(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          this.mapData[y][x] === 1 ? 'obstacle' : 'ground'
        );
        this.tiles[y][x] = tile;
      }
    }
  }

  createPlayer() {
    this.player = this.add.image(
      this.tileSize / 2,
      this.tileSize / 2,
      'player'
    );
    this.playerPos = { x: 0, y: 0 };
    this.updateSignals();
  }

  movePlayerTo(targetX, targetY) {
    // 检查目标是否是障碍
    if (this.mapData[targetY][targetX] === 1) {
      console.log('Target is obstacle');
      return;
    }

    // A* 寻路
    const path = this.findPath(
      this.playerPos.x, this.playerPos.y,
      targetX, targetY
    );

    if (!path || path.length === 0) {
      console.log('No path found');
      window.__signals__.pathFound = false;
      return;
    }

    window.__signals__.pathFound = true;
    console.log('Path found:', JSON.stringify(path));

    // 沿路径移动
    this.isMoving = true;
    this.moveAlongPath(path, 0);
  }

  moveAlongPath(path, index) {
    if (index >= path.length) {
      this.isMoving = false;
      return;
    }

    const pos = path[index];
    this.playerPos = { x: pos.x, y: pos.y };
    this.moveCount++;
    this.updateSignals();

    this.tweens.add({
      targets: this.player,
      x: pos.x * this.tileSize + this.tileSize / 2,
      y: pos.y * this.tileSize + this.tileSize / 2,
      duration: 200,
      onComplete: () => {
        this.moveAlongPath(path, index + 1);
      }
    });
  }

  findPath(startX, startY, endX, endY) {
    // A* 寻路算法实现
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();

    const start = { x: startX, y: startY, g: 0, h: 0, f: 0 };
    openList.push(start);

    while (openList.length > 0) {
      // 找到 f 值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();

      // 到达终点
      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(cameFrom, current);
      }

      const key = `${current.x},${current.y}`;
      closedList.add(key);

      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        const nx = neighbor.x;
        const ny = neighbor.y;

        // 边界检查
        if (nx < 0 || nx >= this.mapSize || ny < 0 || ny >= this.mapSize) {
          continue;
        }

        // 障碍检查
        if (this.mapData[ny][nx] === 1) {
          continue;
        }

        const neighborKey = `${nx},${ny}`;
        if (closedList.has(neighborKey)) {
          continue;
        }

        const g = current.g + 1;
        const h = Math.abs(nx - endX) + Math.abs(ny - endY);
        const f = g + h;

        // 检查是否已在 openList 中
        const existing = openList.find(n => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            cameFrom.set(neighborKey, current);
          }
        } else {
          const newNode = { x: nx, y: ny, g, h, f };
          openList.push(newNode);
          cameFrom.set(neighborKey, current);
        }
      }
    }

    return null; // 没有找到路径
  }

  reconstructPath(cameFrom, current) {
    const path = [{ x: current.x, y: current.y }];
    let key = `${current.x},${current.y}`;

    while (cameFrom.has(key)) {
      const prev = cameFrom.get(key);
      path.unshift({ x: prev.x, y: prev.y });
      key = `${prev.x},${prev.y}`;
    }

    // 移除起点
    path.shift();
    return path;
  }

  updateSignals() {
    window.__signals__.playerX = this.playerPos.x;
    window.__signals__.playerY = this.playerPos.y;
    window.__signals__.moveCount = this.moveCount;
    
    console.log('Player state:', JSON.stringify({
      position: this.playerPos,
      moveCount: this.moveCount
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 460,
  backgroundColor: '#2d2d2d',
  scene: PathfindingScene
};

new Phaser.Game(config);