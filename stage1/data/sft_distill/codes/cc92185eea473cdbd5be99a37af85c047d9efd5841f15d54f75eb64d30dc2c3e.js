// A* 寻路算法实现
class PathFinder {
  constructor(mapData, width, height) {
    this.mapData = mapData;
    this.width = width;
    this.height = height;
  }

  findPath(startX, startY, endX, endY) {
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    
    const start = { x: startX, y: startY, g: 0, h: 0, f: 0 };
    openList.push(start);
    
    while (openList.length > 0) {
      // 找到 f 值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();
      
      // 到达目标
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
        const nKey = `${nx},${ny}`;
        
        // 检查边界和障碍物
        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;
        if (this.mapData[ny][nx] === 1) continue; // 障碍物
        if (closedList.has(nKey)) continue;
        
        const g = current.g + 1;
        const h = Math.abs(nx - endX) + Math.abs(ny - endY);
        const f = g + h;
        
        // 检查是否已在 openList 中
        const existingIndex = openList.findIndex(n => n.x === nx && n.y === ny);
        if (existingIndex === -1) {
          openList.push({ x: nx, y: ny, g, h, f });
          cameFrom.set(nKey, current);
        } else if (g < openList[existingIndex].g) {
          openList[existingIndex].g = g;
          openList[existingIndex].f = f;
          cameFrom.set(nKey, current);
        }
      }
    }
    
    return []; // 没有找到路径
  }
  
  reconstructPath(cameFrom, current) {
    const path = [{ x: current.x, y: current.y }];
    let key = `${current.x},${current.y}`;
    
    while (cameFrom.has(key)) {
      const prev = cameFrom.get(key);
      path.unshift({ x: prev.x, y: prev.y });
      key = `${prev.x},${prev.y}`;
    }
    
    return path;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 12;
    this.tileSize = 48;
    this.obstacleRate = 0.3;
    this.mapData = [];
    this.playerTileX = 0;
    this.playerTileY = 0;
    this.isMoving = false;
    this.currentPath = [];
    this.pathIndex = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      targetPosition: null,
      pathLength: 0,
      obstacleCount: 0,
      moveCount: 0
    };

    // 生成随机地图数据
    this.generateMapData();

    // 创建纹理
    this.createTextures();

    // 创建 Tilemap
    this.createTilemap();

    // 创建玩家
    this.createPlayer();

    // 创建寻路器
    this.pathFinder = new PathFinder(this.mapData, this.mapSize, this.mapSize);

    // 监听点击事件
    this.input.on('pointerdown', this.onMapClick, this);

    // 添加提示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    console.log('Game initialized:', JSON.stringify(window.__signals__));
  }

  generateMapData() {
    // 初始化全部为空地
    for (let y = 0; y < this.mapSize; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.mapData[y][x] = 0;
      }
    }

    // 随机生成障碍物
    let obstacleCount = 0;
    const targetObstacles = Math.floor(this.mapSize * this.mapSize * this.obstacleRate);
    
    while (obstacleCount < targetObstacles) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 确保起始位置(0,0)不是障碍物
      if (x === 0 && y === 0) continue;
      
      if (this.mapData[y][x] === 0) {
        this.mapData[y][x] = 1;
        obstacleCount++;
      }
    }

    window.__signals__.obstacleCount = obstacleCount;
  }

  createTextures() {
    // 创建地砖纹理（浅灰色）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.lineStyle(2, 0x999999, 1);
    floorGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.generateTexture('floor', this.tileSize, this.tileSize);
    floorGraphics.destroy();

    // 创建障碍物纹理（深灰色）
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0x333333, 1);
    obstacleGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    obstacleGraphics.lineStyle(2, 0x000000, 1);
    obstacleGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    obstacleGraphics.generateTexture('obstacle', this.tileSize, this.tileSize);
    obstacleGraphics.destroy();

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.lineStyle(3, 0xffffff, 1);
    playerGraphics.strokeCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();
  }

  createTilemap() {
    // 使用空白 Tilemap 配置
    const map = this.make.tilemap({
      data: this.mapData,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize
    });

    // 添加 tileset
    const tiles = map.addTilesetImage('floor', 'floor');
    
    // 创建图层
    this.layer = map.createLayer(0, tiles, 0, 0);

    // 手动渲染障碍物（因为 Tilemap 的限制）
    this.obstacleSprites = [];
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        if (this.mapData[y][x] === 1) {
          const obstacle = this.add.image(
            x * this.tileSize + this.tileSize / 2,
            y * this.tileSize + this.tileSize / 2,
            'obstacle'
          );
          this.obstacleSprites.push(obstacle);
        }
      }
    }
  }

  createPlayer() {
    this.playerTileX = 0;
    this.playerTileY = 0;
    
    this.player = this.add.image(
      this.playerTileX * this.tileSize + this.tileSize / 2,
      this.playerTileY * this.tileSize + this.tileSize / 2,
      'player'
    );

    window.__signals__.playerPosition = { x: this.playerTileX, y: this.playerTileY };
  }

  onMapClick(pointer) {
    if (this.isMoving) return;

    const tileX = Math.floor(pointer.x / this.tileSize);
    const tileY = Math.floor(pointer.y / this.tileSize);

    // 检查点击位置是否有效
    if (tileX < 0 || tileX >= this.mapSize || tileY < 0 || tileY >= this.mapSize) {
      return;
    }

    if (this.mapData[tileY][tileX] === 1) {
      console.log('Cannot move to obstacle');
      return;
    }

    // 寻找路径
    const path = this.pathFinder.findPath(
      this.playerTileX,
      this.playerTileY,
      tileX,
      tileY
    );

    if (path.length === 0) {
      console.log('No path found');
      return;
    }

    // 更新信号
    window.__signals__.targetPosition = { x: tileX, y: tileY };
    window.__signals__.pathLength = path.length;

    console.log('Path found:', JSON.stringify({
      from: { x: this.playerTileX, y: this.playerTileY },
      to: { x: tileX, y: tileY },
      pathLength: path.length
    }));

    // 开始移动
    this.currentPath = path;
    this.pathIndex = 1; // 跳过起始位置
    this.isMoving = true;
    this.moveAlongPath();
  }

  moveAlongPath() {
    if (this.pathIndex >= this.currentPath.length) {
      this.isMoving = false;
      window.__signals__.moveCount++;
      console.log('Movement complete:', JSON.stringify(window.__signals__));
      return;
    }

    const target = this.currentPath[this.pathIndex];
    this.playerTileX = target.x;
    this.playerTileY = target.y;

    // 移动玩家
    this.tweens.add({
      targets: this.player,
      x: target.x * this.tileSize + this.tileSize / 2,
      y: target.y * this.tileSize + this.tileSize / 2,
      duration: 200,
      onComplete: () => {
        window.__signals__.playerPosition = { x: this.playerTileX, y: this.playerTileY };
        this.updateInfoText();
        this.pathIndex++;
        this.moveAlongPath();
      }
    });
  }

  updateInfoText() {
    const info = [
      `Player: (${this.playerTileX}, ${this.playerTileY})`,
      `Obstacles: ${window.__signals__.obstacleCount}`,
      `Moves: ${window.__signals__.moveCount}`,
      `Click to move (with pathfinding)`
    ];
    this.infoText.setText(info.join('\n'));
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 576, // 12 * 48
  height: 576,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);