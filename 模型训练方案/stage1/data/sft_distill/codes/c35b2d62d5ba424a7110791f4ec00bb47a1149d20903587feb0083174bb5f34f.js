class PathfindingScene extends Phaser.Scene {
  constructor() {
    super('PathfindingScene');
    this.mapSize = 20;
    this.tileSize = 30;
    this.mapData = [];
    this.player = { x: 0, y: 0 };
    this.moveCount = 0; // 状态信号：移动次数
    this.pathLength = 0; // 状态信号：当前路径长度
    this.isMoving = false;
    this.currentPath = [];
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 生成地图数据（0=地面，1=障碍）
    this.generateMap();
    
    // 创建纹理
    this.createTextures();
    
    // 绘制地图
    this.drawMap();
    
    // 创建玩家精灵
    this.playerSprite = this.add.sprite(
      this.player.x * this.tileSize + this.tileSize / 2,
      this.player.y * this.tileSize + this.tileSize / 2,
      'player'
    );
    
    // 添加点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.isMoving) {
        this.handleClick(pointer);
      }
    });
    
    // 显示状态信息
    this.statusText = this.add.text(10, this.mapSize * this.tileSize + 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.updateStatus();
  }

  generateMap() {
    // 初始化地图为全地面
    for (let y = 0; y < this.mapSize; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.mapData[y][x] = 0;
      }
    }
    
    // 随机生成30%障碍物
    const obstacleCount = Math.floor(this.mapSize * this.mapSize * 0.3);
    let placed = 0;
    
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 避免在起点(0,0)放置障碍
      if ((x !== 0 || y !== 0) && this.mapData[y][x] === 0) {
        this.mapData[y][x] = 1;
        placed++;
      }
    }
    
    // 确保起点可用
    this.mapData[0][0] = 0;
    this.player.x = 0;
    this.player.y = 0;
  }

  createTextures() {
    // 地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x90EE90, 1);
    groundGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    groundGraphics.lineStyle(1, 0x006400, 0.3);
    groundGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    groundGraphics.generateTexture('ground', this.tileSize, this.tileSize);
    groundGraphics.destroy();
    
    // 障碍纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x8B4513, 1);
    wallGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    wallGraphics.lineStyle(2, 0x654321, 1);
    wallGraphics.strokeRect(2, 2, this.tileSize - 4, this.tileSize - 4);
    wallGraphics.generateTexture('wall', this.tileSize, this.tileSize);
    wallGraphics.destroy();
    
    // 玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000FF, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.lineStyle(2, 0xFFFFFF, 1);
    playerGraphics.strokeCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();
    
    // 路径标记纹理
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xFFFF00, 0.5);
    pathGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    pathGraphics.generateTexture('path', this.tileSize, this.tileSize);
    pathGraphics.destroy();
  }

  drawMap() {
    this.tiles = [];
    
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const texture = this.mapData[y][x] === 1 ? 'wall' : 'ground';
        const tile = this.add.image(
          x * this.tileSize,
          y * this.tileSize,
          texture
        ).setOrigin(0, 0);
        this.tiles[y][x] = tile;
      }
    }
  }

  handleClick(pointer) {
    const tileX = Math.floor(pointer.x / this.tileSize);
    const tileY = Math.floor(pointer.y / this.tileSize);
    
    // 检查点击是否在地图范围内
    if (tileX < 0 || tileX >= this.mapSize || tileY < 0 || tileY >= this.mapSize) {
      return;
    }
    
    // 检查目标是否是障碍
    if (this.mapData[tileY][tileX] === 1) {
      return;
    }
    
    // 寻路
    const path = this.findPath(
      { x: this.player.x, y: this.player.y },
      { x: tileX, y: tileY }
    );
    
    if (path && path.length > 0) {
      this.moveAlongPath(path);
    }
  }

  findPath(start, end) {
    // A*寻路算法
    const openList = [];
    const closedList = [];
    const cameFrom = {};
    
    const startKey = `${start.x},${start.y}`;
    const endKey = `${end.x},${end.y}`;
    
    openList.push({
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: this.heuristic(start, end)
    });
    
    while (openList.length > 0) {
      // 找到f值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();
      const currentKey = `${current.x},${current.y}`;
      
      // 到达目标
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(cameFrom, currentKey);
      }
      
      closedList.push(currentKey);
      
      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        // 检查是否越界或是障碍
        if (neighbor.x < 0 || neighbor.x >= this.mapSize ||
            neighbor.y < 0 || neighbor.y >= this.mapSize ||
            this.mapData[neighbor.y][neighbor.x] === 1) {
          continue;
        }
        
        // 已在关闭列表中
        if (closedList.includes(neighborKey)) {
          continue;
        }
        
        const g = current.g + 1;
        const h = this.heuristic(neighbor, end);
        const f = g + h;
        
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          openList.push({ x: neighbor.x, y: neighbor.y, g, h, f });
          cameFrom[neighborKey] = currentKey;
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          cameFrom[neighborKey] = currentKey;
        }
      }
    }
    
    return null; // 无路径
  }

  heuristic(a, b) {
    // 曼哈顿距离
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  reconstructPath(cameFrom, currentKey) {
    const path = [];
    let current = currentKey;
    
    while (cameFrom[current]) {
      const [x, y] = current.split(',').map(Number);
      path.unshift({ x, y });
      current = cameFrom[current];
    }
    
    return path;
  }

  moveAlongPath(path) {
    this.isMoving = true;
    this.currentPath = path;
    this.pathLength = path.length;
    
    // 清除之前的路径标记
    if (this.pathMarkers) {
      this.pathMarkers.forEach(marker => marker.destroy());
    }
    this.pathMarkers = [];
    
    // 显示路径
    path.forEach(point => {
      const marker = this.add.image(
        point.x * this.tileSize,
        point.y * this.tileSize,
        'path'
      ).setOrigin(0, 0).setAlpha(0.5);
      this.pathMarkers.push(marker);
    });
    
    this.moveToNextPoint();
  }

  moveToNextPoint() {
    if (this.currentPath.length === 0) {
      this.isMoving = false;
      // 清除路径标记
      if (this.pathMarkers) {
        this.pathMarkers.forEach(marker => marker.destroy());
        this.pathMarkers = [];
      }
      return;
    }
    
    const nextPoint = this.currentPath.shift();
    this.player.x = nextPoint.x;
    this.player.y = nextPoint.y;
    this.moveCount++;
    
    // 移动玩家精灵
    this.tweens.add({
      targets: this.playerSprite,
      x: nextPoint.x * this.tileSize + this.tileSize / 2,
      y: nextPoint.y * this.tileSize + this.tileSize / 2,
      duration: 200,
      onComplete: () => {
        this.updateStatus();
        this.moveToNextPoint();
      }
    });
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.player.x}, ${this.player.y}) | ` +
      `Moves: ${this.moveCount} | ` +
      `Path Length: ${this.pathLength}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 650,
  backgroundColor: '#2d2d2d',
  scene: PathfindingScene
};

new Phaser.Game(config);