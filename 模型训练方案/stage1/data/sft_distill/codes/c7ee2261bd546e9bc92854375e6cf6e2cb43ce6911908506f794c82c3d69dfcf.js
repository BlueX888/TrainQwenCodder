class PathfindingScene extends Phaser.Scene {
  constructor() {
    super('PathfindingScene');
    this.mapSize = 15;
    this.tileSize = 40;
    this.obstacleRate = 0.3;
    this.map = [];
    this.playerPos = { x: 0, y: 0 };
    this.moveCount = 0; // 状态信号：移动步数
    this.pathLength = 0; // 状态信号：当前路径长度
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
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatus();
  }

  generateMap() {
    // 初始化地图为全空
    for (let y = 0; y < this.mapSize; y++) {
      this.map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.map[y][x] = 0;
      }
    }
    
    // 随机生成障碍物
    const totalTiles = this.mapSize * this.mapSize;
    const obstacleCount = Math.floor(totalTiles * this.obstacleRate);
    
    let placed = 0;
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 确保起点(0,0)不是障碍物
      if ((x === 0 && y === 0) || this.map[y][x] === 1) {
        continue;
      }
      
      this.map[y][x] = 1; // 1表示障碍物
      placed++;
    }
    
    // 设置玩家初始位置
    this.playerPos = { x: 0, y: 0 };
  }

  drawMap() {
    this.mapGraphics = this.add.graphics();
    
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const screenX = x * this.tileSize;
        const screenY = y * this.tileSize + 50; // 留出顶部空间显示状态
        
        if (this.map[y][x] === 1) {
          // 障碍物 - 深灰色
          this.mapGraphics.fillStyle(0x333333, 1);
        } else {
          // 地面 - 浅灰色
          this.mapGraphics.fillStyle(0xcccccc, 1);
        }
        
        this.mapGraphics.fillRect(screenX, screenY, this.tileSize - 2, this.tileSize - 2);
      }
    }
  }

  createPlayer() {
    this.playerGraphics = this.add.graphics();
    this.updatePlayerPosition();
  }

  updatePlayerPosition() {
    this.playerGraphics.clear();
    this.playerGraphics.fillStyle(0x00ff00, 1);
    
    const screenX = this.playerPos.x * this.tileSize + this.tileSize / 2;
    const screenY = this.playerPos.y * this.tileSize + this.tileSize / 2 + 50;
    
    this.playerGraphics.fillCircle(screenX, screenY, this.tileSize / 3);
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    // 转换屏幕坐标到网格坐标
    const gridX = Math.floor(pointer.x / this.tileSize);
    const gridY = Math.floor((pointer.y - 50) / this.tileSize);
    
    // 检查点击是否在地图范围内
    if (gridX < 0 || gridX >= this.mapSize || gridY < 0 || gridY >= this.mapSize) {
      return;
    }
    
    // 检查目标是否是障碍物
    if (this.map[gridY][gridX] === 1) {
      return;
    }
    
    // 寻找路径
    const path = this.findPath(this.playerPos, { x: gridX, y: gridY });
    
    if (path && path.length > 0) {
      this.currentPath = path;
      this.pathLength = path.length;
      this.moveAlongPath();
    }
  }

  findPath(start, end) {
    // A*寻路算法实现
    const openList = [];
    const closedList = [];
    const startNode = { ...start, g: 0, h: 0, f: 0, parent: null };
    
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
      
      // 到达终点
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }
      
      // 从开放列表移到关闭列表
      openList.splice(currentIndex, 1);
      closedList.push(current);
      
      // 检查相邻节点
      const neighbors = this.getNeighbors(current);
      
      for (const neighbor of neighbors) {
        // 跳过已在关闭列表中的节点
        if (closedList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          continue;
        }
        
        const gScore = current.g + 1;
        const hScore = Math.abs(neighbor.x - end.x) + Math.abs(neighbor.y - end.y);
        const fScore = gScore + hScore;
        
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          openList.push({
            x: neighbor.x,
            y: neighbor.y,
            g: gScore,
            h: hScore,
            f: fScore,
            parent: current
          });
        } else if (gScore < existingNode.g) {
          existingNode.g = gScore;
          existingNode.f = fScore;
          existingNode.parent = current;
        }
      }
    }
    
    return null; // 没有找到路径
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
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;
      
      // 检查边界和障碍物
      if (newX >= 0 && newX < this.mapSize && 
          newY >= 0 && newY < this.mapSize && 
          this.map[newY][newX] === 0) {
        neighbors.push({ x: newX, y: newY });
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
    if (this.currentPath.length === 0) {
      this.isMoving = false;
      return;
    }
    
    this.isMoving = true;
    const nextPos = this.currentPath.shift();
    
    this.playerPos = nextPos;
    this.moveCount++;
    this.updatePlayerPosition();
    this.updateStatus();
    
    // 延迟后继续移动
    this.time.delayedCall(200, () => {
      this.moveAlongPath();
    });
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.playerPos.x}, ${this.playerPos.y}) | ` +
      `Moves: ${this.moveCount} | ` +
      `Path Length: ${this.pathLength} | ` +
      `Moving: ${this.isMoving ? 'Yes' : 'No'}`
    );
  }

  update() {
    // 每帧更新（如需要）
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