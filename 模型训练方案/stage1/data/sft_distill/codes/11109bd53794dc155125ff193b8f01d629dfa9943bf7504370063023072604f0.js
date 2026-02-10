class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 12;
    this.tileSize = 50;
    this.obstacleRate = 0.3;
    this.map = [];
    this.playerPos = { x: 0, y: 0 };
    this.moveCount = 0;
    this.isMoving = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      playerPos: { x: 0, y: 0 },
      moveCount: 0,
      mapGenerated: false,
      pathFound: false,
      obstacleCount: 0
    };

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
    
    // 添加提示文本
    this.add.text(10, 10, 'Click to move player', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.updateStatus();
    
    console.log('[INIT] Map generated:', JSON.stringify(window.__signals__));
  }

  generateMap() {
    // 初始化地图为全0（可通行）
    for (let y = 0; y < this.mapSize; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.map[y][x] = 0;
      }
    }

    // 随机生成障碍物（排除起点）
    let obstacleCount = 0;
    const targetObstacles = Math.floor(this.mapSize * this.mapSize * this.obstacleRate);
    
    while (obstacleCount < targetObstacles) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 不在起点(0,0)放置障碍
      if ((x !== 0 || y !== 0) && this.map[y][x] === 0) {
        this.map[y][x] = 1;
        obstacleCount++;
      }
    }

    window.__signals__.mapGenerated = true;
    window.__signals__.obstacleCount = obstacleCount;
  }

  createTextures() {
    // 地面纹理（浅灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0xcccccc, 1);
    groundGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    groundGraphics.lineStyle(1, 0x999999, 1);
    groundGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    groundGraphics.generateTexture('ground', this.tileSize, this.tileSize);
    groundGraphics.destroy();

    // 障碍物纹理（深灰色）
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0x333333, 1);
    obstacleGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    obstacleGraphics.lineStyle(1, 0x000000, 1);
    obstacleGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    obstacleGraphics.generateTexture('obstacle', this.tileSize, this.tileSize);
    obstacleGraphics.destroy();

    // 玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();

    // 路径纹理（黄色半透明）
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xffff00, 0.3);
    pathGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    pathGraphics.generateTexture('path', this.tileSize, this.tileSize);
    pathGraphics.destroy();
  }

  drawMap() {
    this.tiles = [];
    
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const tileX = x * this.tileSize;
        const tileY = y * this.tileSize;
        const tileType = this.map[y][x] === 0 ? 'ground' : 'obstacle';
        
        const tile = this.add.image(tileX, tileY, tileType).setOrigin(0, 0);
        this.tiles[y][x] = tile;
      }
    }
  }

  createPlayer() {
    this.player = this.add.image(0, 0, 'player').setOrigin(0, 0);
    this.playerPos = { x: 0, y: 0 };
    window.__signals__.playerPos = { ...this.playerPos };
  }

  handleClick(pointer) {
    if (this.isMoving) return;

    const tileX = Math.floor(pointer.x / this.tileSize);
    const tileY = Math.floor(pointer.y / this.tileSize);

    // 检查点击是否在地图范围内
    if (tileX < 0 || tileX >= this.mapSize || tileY < 0 || tileY >= this.mapSize) {
      return;
    }

    // 检查目标是否是障碍物
    if (this.map[tileY][tileX] === 1) {
      console.log('[CLICK] Target is obstacle');
      return;
    }

    // 寻路
    const path = this.findPath(this.playerPos, { x: tileX, y: tileY });
    
    if (path && path.length > 0) {
      window.__signals__.pathFound = true;
      console.log('[PATH] Found path with length:', path.length);
      this.moveAlongPath(path);
    } else {
      window.__signals__.pathFound = false;
      console.log('[PATH] No path found');
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
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openList[currentIndex];

      // 到达目标
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }

      // 从开放列表移除，加入关闭列表
      openList.splice(currentIndex, 1);
      closedList.push(current);

      // 检查相邻节点
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        // 跳过已在关闭列表中的节点
        if (closedList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          continue;
        }

        const g = current.g + 1;
        const h = this.heuristic(neighbor, end);
        const f = g + h;

        // 检查是否已在开放列表中
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

      // 检查是否在地图范围内且不是障碍物
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

  moveAlongPath(path) {
    if (path.length === 0) return;

    this.isMoving = true;
    let index = 0;

    // 清除之前的路径显示
    if (this.pathSprites) {
      this.pathSprites.forEach(sprite => sprite.destroy());
    }
    this.pathSprites = [];

    // 显示路径
    path.forEach(pos => {
      const pathSprite = this.add.image(pos.x * this.tileSize, pos.y * this.tileSize, 'path')
        .setOrigin(0, 0)
        .setDepth(-1);
      this.pathSprites.push(pathSprite);
    });

    const moveNext = () => {
      if (index >= path.length) {
        this.isMoving = false;
        // 清除路径显示
        this.pathSprites.forEach(sprite => sprite.destroy());
        this.pathSprites = [];
        return;
      }

      const target = path[index];
      this.playerPos = { x: target.x, y: target.y };
      
      this.tweens.add({
        targets: this.player,
        x: target.x * this.tileSize,
        y: target.y * this.tileSize,
        duration: 200,
        onComplete: () => {
          this.moveCount++;
          window.__signals__.playerPos = { ...this.playerPos };
          window.__signals__.moveCount = this.moveCount;
          this.updateStatus();
          
          console.log('[MOVE]', JSON.stringify({
            position: this.playerPos,
            moveCount: this.moveCount
          }));
          
          index++;
          moveNext();
        }
      });
    };

    moveNext();
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.playerPos.x}, ${this.playerPos.y}) | Moves: ${this.moveCount}`
    );
  }

  update(time, delta) {
    // 每帧更新逻辑（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);