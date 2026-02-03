class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 5;
    this.tileSize = 80;
    this.map = [];
    this.playerPos = { x: 0, y: 0 };
    this.path = [];
    this.isMoving = false;
    this.moveSpeed = 200; // 移动速度 (ms/格)
    
    // 可验证状态信号
    window.__signals__ = {
      mapGenerated: false,
      obstacleCount: 0,
      playerMoves: 0,
      currentPath: [],
      playerPosition: { x: 0, y: 0 }
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成地图
    this.generateMap();
    
    // 创建纹理
    this.createTextures();
    
    // 绘制地图
    this.drawMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 添加点击事件
    this.input.on('pointerdown', this.handleClick, this);
    
    // 添加说明文字
    this.add.text(10, 420, 'Click on green tiles to move player', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    this.add.text(10, 445, 'Blue: Player | Green: Path | Gray: Obstacle', {
      fontSize: '14px',
      color: '#cccccc'
    });
    
    // 输出初始状态
    console.log('Game initialized:', JSON.stringify(window.__signals__, null, 2));
  }

  generateMap() {
    // 初始化地图为全通行
    for (let y = 0; y < this.mapSize; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.map[y][x] = 0; // 0 = 可通行
      }
    }
    
    // 确保起点可通行
    this.map[0][0] = 0;
    
    // 随机生成30%障碍
    const totalTiles = this.mapSize * this.mapSize;
    const obstacleCount = Math.floor(totalTiles * 0.3);
    let placed = 0;
    
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 不在起点生成障碍
      if ((x === 0 && y === 0) || this.map[y][x] === 1) {
        continue;
      }
      
      this.map[y][x] = 1; // 1 = 障碍
      placed++;
    }
    
    window.__signals__.mapGenerated = true;
    window.__signals__.obstacleCount = placed;
  }

  createTextures() {
    // 创建地面纹理 (绿色)
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x88cc88, 1);
    groundGraphics.fillRect(0, 0, this.tileSize - 2, this.tileSize - 2);
    groundGraphics.lineStyle(2, 0x66aa66, 1);
    groundGraphics.strokeRect(0, 0, this.tileSize - 2, this.tileSize - 2);
    groundGraphics.generateTexture('ground', this.tileSize, this.tileSize);
    groundGraphics.destroy();
    
    // 创建障碍纹理 (灰色)
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0x666666, 1);
    obstacleGraphics.fillRect(0, 0, this.tileSize - 2, this.tileSize - 2);
    obstacleGraphics.lineStyle(2, 0x444444, 1);
    obstacleGraphics.strokeRect(0, 0, this.tileSize - 2, this.tileSize - 2);
    obstacleGraphics.generateTexture('obstacle', this.tileSize, this.tileSize);
    obstacleGraphics.destroy();
    
    // 创建玩家纹理 (蓝色圆形)
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4444ff, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.lineStyle(3, 0x2222cc, 1);
    playerGraphics.strokeCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();
  }

  drawMap() {
    this.tiles = [];
    
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const posX = x * this.tileSize + 10;
        const posY = y * this.tileSize + 10;
        
        const texture = this.map[y][x] === 1 ? 'obstacle' : 'ground';
        const tile = this.add.image(posX, posY, texture).setOrigin(0, 0);
        tile.setInteractive();
        tile.gridX = x;
        tile.gridY = y;
        
        this.tiles[y][x] = tile;
      }
    }
  }

  createPlayer() {
    const posX = this.playerPos.x * this.tileSize + 10;
    const posY = this.playerPos.y * this.tileSize + 10;
    
    this.player = this.add.image(posX, posY, 'player').setOrigin(0, 0);
    this.player.setDepth(10);
    
    window.__signals__.playerPosition = { ...this.playerPos };
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    // 计算点击的网格位置
    const gridX = Math.floor((pointer.x - 10) / this.tileSize);
    const gridY = Math.floor((pointer.y - 10) / this.tileSize);
    
    // 检查是否在地图范围内
    if (gridX < 0 || gridX >= this.mapSize || gridY < 0 || gridY >= this.mapSize) {
      return;
    }
    
    // 检查是否是障碍
    if (this.map[gridY][gridX] === 1) {
      console.log('Cannot move to obstacle at', gridX, gridY);
      return;
    }
    
    // 寻路
    const path = this.findPath(this.playerPos, { x: gridX, y: gridY });
    
    if (path && path.length > 0) {
      this.path = path;
      window.__signals__.currentPath = path.map(p => ({ x: p.x, y: p.y }));
      console.log('Path found:', JSON.stringify(window.__signals__.currentPath));
      this.moveAlongPath();
    } else {
      console.log('No path found to', gridX, gridY);
    }
  }

  findPath(start, end) {
    // A* 寻路算法
    const openList = [];
    const closedList = [];
    
    const startNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
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
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }
      
      closedList.push(current);
      
      // 检查相邻节点
      const neighbors = this.getNeighbors(current);
      
      for (const neighbor of neighbors) {
        if (closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          continue;
        }
        
        const g = current.g + 1;
        const h = this.heuristic(neighbor, end);
        const f = g + h;
        
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          openList.push({
            x: neighbor.x,
            y: neighbor.y,
            g: g,
            h: h,
            f: f,
            parent: current
          });
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      }
    }
    
    return null; // 没有找到路径
  }

  heuristic(a, b) {
    // 曼哈顿距离
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  getNeighbors(node) {
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
      
      if (x >= 0 && x < this.mapSize && y >= 0 && y < this.mapSize && this.map[y][x] === 0) {
        neighbors.push({ x, y });
      }
    }
    
    return neighbors;
  }

  reconstructPath(node) {
    const path = [];
    let current = node;
    
    while (current.parent) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    
    return path;
  }

  moveAlongPath() {
    if (this.path.length === 0) {
      this.isMoving = false;
      return;
    }
    
    this.isMoving = true;
    const nextPos = this.path.shift();
    
    const targetX = nextPos.x * this.tileSize + 10;
    const targetY = nextPos.y * this.tileSize + 10;
    
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: this.moveSpeed,
      onComplete: () => {
        this.playerPos = { x: nextPos.x, y: nextPos.y };
        window.__signals__.playerPosition = { ...this.playerPos };
        window.__signals__.playerMoves++;
        
        console.log('Player moved to:', JSON.stringify(this.playerPos));
        
        this.moveAlongPath();
      }
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);