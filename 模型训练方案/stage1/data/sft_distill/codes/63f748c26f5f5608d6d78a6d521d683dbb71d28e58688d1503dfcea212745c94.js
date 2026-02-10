class PathfindingScene extends Phaser.Scene {
  constructor() {
    super('PathfindingScene');
    this.mapSize = 15;
    this.tileSize = 40;
    this.obstacleRate = 0.3;
    this.map = [];
    this.playerPos = { x: 0, y: 0 };
    this.moveCount = 0; // 状态信号：移动次数
    this.pathfindingStatus = 'idle'; // 状态信号：寻路状态
    this.isMoving = false;
    this.currentPath = [];
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
    
    // 显示状态信息
    this.createUI();
    
    console.log('Game initialized - Map size:', this.mapSize, 'x', this.mapSize);
    console.log('Player position:', this.playerPos);
  }

  generateMap() {
    // 初始化地图为全空
    for (let y = 0; y < this.mapSize; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.map[y][x] = 0; // 0=可通行, 1=障碍
      }
    }
    
    // 随机生成障碍物
    const totalTiles = this.mapSize * this.mapSize;
    const obstacleCount = Math.floor(totalTiles * this.obstacleRate);
    let placed = 0;
    
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 确保起点(0,0)不是障碍
      if ((x === 0 && y === 0) || this.map[y][x] === 1) {
        continue;
      }
      
      this.map[y][x] = 1;
      placed++;
    }
    
    console.log('Map generated with', placed, 'obstacles');
  }

  drawMap() {
    const graphics = this.add.graphics();
    
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        // 绘制地板
        if (this.map[y][x] === 0) {
          graphics.fillStyle(0xcccccc, 1);
        } else {
          // 绘制障碍
          graphics.fillStyle(0x333333, 1);
        }
        
        graphics.fillRect(px, py, this.tileSize, this.tileSize);
        
        // 绘制网格线
        graphics.lineStyle(1, 0x999999, 0.5);
        graphics.strokeRect(px, py, this.tileSize, this.tileSize);
      }
    }
  }

  createPlayer() {
    // 使用Graphics创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    graphics.generateTexture('player', this.tileSize, this.tileSize);
    graphics.destroy();
    
    // 创建玩家精灵
    this.player = this.add.sprite(
      this.playerPos.x * this.tileSize + this.tileSize / 2,
      this.playerPos.y * this.tileSize + this.tileSize / 2,
      'player'
    );
  }

  createUI() {
    this.statusText = this.add.text(10, this.mapSize * this.tileSize + 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateUI();
  }

  updateUI() {
    this.statusText.setText(
      `Position: (${this.playerPos.x}, ${this.playerPos.y}) | ` +
      `Moves: ${this.moveCount} | ` +
      `Status: ${this.pathfindingStatus}`
    );
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    // 转换点击坐标为网格坐标
    const gridX = Math.floor(pointer.x / this.tileSize);
    const gridY = Math.floor(pointer.y / this.tileSize);
    
    // 检查点击是否在地图范围内
    if (gridX < 0 || gridX >= this.mapSize || gridY < 0 || gridY >= this.mapSize) {
      return;
    }
    
    // 检查目标是否可通行
    if (this.map[gridY][gridX] === 1) {
      this.pathfindingStatus = 'blocked';
      this.updateUI();
      console.log('Target is blocked');
      return;
    }
    
    // 寻路
    this.pathfindingStatus = 'searching';
    this.updateUI();
    
    const path = this.findPath(this.playerPos, { x: gridX, y: gridY });
    
    if (path && path.length > 0) {
      this.pathfindingStatus = 'moving';
      this.currentPath = path;
      this.moveAlongPath();
      console.log('Path found, length:', path.length);
    } else {
      this.pathfindingStatus = 'no_path';
      this.updateUI();
      console.log('No path found');
    }
  }

  findPath(start, end) {
    // A*寻路算法实现
    const openList = [];
    const closedList = new Set();
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
      // 找到f值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();
      
      // 到达目标
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }
      
      closedList.add(`${current.x},${current.y}`);
      
      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        // 检查边界和障碍
        if (neighbor.x < 0 || neighbor.x >= this.mapSize ||
            neighbor.y < 0 || neighbor.y >= this.mapSize ||
            this.map[neighbor.y][neighbor.x] === 1) {
          continue;
        }
        
        const key = `${neighbor.x},${neighbor.y}`;
        if (closedList.has(key)) continue;
        
        const g = current.g + 1;
        const h = this.heuristic(neighbor, end);
        const f = g + h;
        
        // 检查是否已在openList中
        const existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
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
    if (this.currentPath.length === 0) {
      this.isMoving = false;
      this.pathfindingStatus = 'idle';
      this.updateUI();
      return;
    }
    
    this.isMoving = true;
    const nextPos = this.currentPath.shift();
    
    // 移动玩家
    this.tweens.add({
      targets: this.player,
      x: nextPos.x * this.tileSize + this.tileSize / 2,
      y: nextPos.y * this.tileSize + this.tileSize / 2,
      duration: 200,
      onComplete: () => {
        this.playerPos = nextPos;
        this.moveCount++;
        this.updateUI();
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
  width: 600,
  height: 650,
  backgroundColor: '#222222',
  scene: PathfindingScene
};

new Phaser.Game(config);