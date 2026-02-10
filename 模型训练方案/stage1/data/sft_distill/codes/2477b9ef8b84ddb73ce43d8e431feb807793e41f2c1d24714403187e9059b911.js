class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 15;
    this.tileSize = 40;
    this.obstacleRate = 0.3;
    this.map = [];
    this.player = null;
    this.playerGridX = 0;
    this.playerGridY = 0;
    this.path = [];
    this.moveCount = 0; // 可验证状态
    this.isMoving = false;
    this.moveSpeed = 200; // 像素/秒
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成地图数据
    this.generateMap();
    
    // 绘制地图
    this.drawMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 添加点击事件
    this.input.on('pointerdown', this.handleClick, this);
    
    // 显示状态文本
    this.statusText = this.add.text(10, this.mapSize * this.tileSize + 10, 
      'Move Count: 0 | Click to move player', 
      { fontSize: '16px', fill: '#fff' });
  }

  generateMap() {
    // 初始化地图为全空
    for (let y = 0; y < this.mapSize; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.map[y][x] = 0; // 0 = 可通行
      }
    }

    // 随机放置障碍物
    const totalTiles = this.mapSize * this.mapSize;
    const obstacleCount = Math.floor(totalTiles * this.obstacleRate);
    
    let placed = 0;
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 确保起始位置(0,0)不是障碍
      if ((x === 0 && y === 0) || this.map[y][x] === 1) {
        continue;
      }
      
      this.map[y][x] = 1; // 1 = 障碍
      placed++;
    }
  }

  drawMap() {
    const graphics = this.add.graphics();
    
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        if (this.map[y][x] === 1) {
          // 障碍物 - 深灰色
          graphics.fillStyle(0x333333, 1);
        } else {
          // 地板 - 浅灰色
          graphics.fillStyle(0xcccccc, 1);
        }
        
        graphics.fillRect(px, py, this.tileSize, this.tileSize);
        
        // 绘制网格线
        graphics.lineStyle(1, 0x666666, 0.5);
        graphics.strokeRect(px, py, this.tileSize, this.tileSize);
      }
    }
  }

  createPlayer() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    graphics.generateTexture('player', this.tileSize, this.tileSize);
    graphics.destroy();
    
    this.player = this.add.sprite(
      this.tileSize / 2, 
      this.tileSize / 2, 
      'player'
    );
    this.playerGridX = 0;
    this.playerGridY = 0;
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    // 转换为网格坐标
    const gridX = Math.floor(pointer.x / this.tileSize);
    const gridY = Math.floor(pointer.y / this.tileSize);
    
    // 检查是否在地图范围内且可通行
    if (gridX < 0 || gridX >= this.mapSize || 
        gridY < 0 || gridY >= this.mapSize ||
        this.map[gridY][gridX] === 1) {
      return;
    }
    
    // 寻路
    this.path = this.findPath(
      this.playerGridX, this.playerGridY,
      gridX, gridY
    );
    
    if (this.path.length > 0) {
      this.moveAlongPath();
    }
  }

  findPath(startX, startY, endX, endY) {
    // A* 寻路算法
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    
    const start = { x: startX, y: startY, g: 0, h: 0, f: 0 };
    start.h = this.heuristic(startX, startY, endX, endY);
    start.f = start.h;
    openList.push(start);
    
    while (openList.length > 0) {
      // 找到f值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();
      
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
        
        // 检查是否越界或是障碍或已访问
        if (nx < 0 || nx >= this.mapSize || 
            ny < 0 || ny >= this.mapSize ||
            this.map[ny][nx] === 1 ||
            closedList.has(nKey)) {
          continue;
        }
        
        const g = current.g + 1;
        const h = this.heuristic(nx, ny, endX, endY);
        const f = g + h;
        
        const existingNode = openList.find(n => n.x === nx && n.y === ny);
        
        if (!existingNode) {
          openList.push({ x: nx, y: ny, g, h, f });
          cameFrom.set(nKey, { x: current.x, y: current.y });
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          cameFrom.set(nKey, { x: current.x, y: current.y });
        }
      }
    }
    
    return []; // 没有找到路径
  }

  heuristic(x1, y1, x2, y2) {
    // 曼哈顿距离
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  reconstructPath(cameFrom, current) {
    const path = [];
    let node = current;
    
    while (true) {
      path.unshift({ x: node.x, y: node.y });
      const key = `${node.x},${node.y}`;
      if (!cameFrom.has(key)) break;
      node = cameFrom.get(key);
    }
    
    // 移除起始点
    path.shift();
    return path;
  }

  moveAlongPath() {
    if (this.path.length === 0) {
      this.isMoving = false;
      return;
    }
    
    this.isMoving = true;
    const nextPos = this.path.shift();
    
    const targetX = nextPos.x * this.tileSize + this.tileSize / 2;
    const targetY = nextPos.y * this.tileSize + this.tileSize / 2;
    
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y, targetX, targetY
    );
    const duration = (distance / this.moveSpeed) * 1000;
    
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: duration,
      onComplete: () => {
        this.playerGridX = nextPos.x;
        this.playerGridY = nextPos.y;
        this.moveCount++;
        this.statusText.setText(
          `Move Count: ${this.moveCount} | Click to move player`
        );
        this.moveAlongPath();
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 650,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);