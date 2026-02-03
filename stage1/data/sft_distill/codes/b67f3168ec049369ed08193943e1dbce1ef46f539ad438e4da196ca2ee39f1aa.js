class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 3;
    this.tileSize = 150;
    this.mapData = [];
    this.playerPos = { x: 0, y: 0 };
    this.moveCount = 0; // 状态信号：移动次数
    this.isMoving = false;
    this.path = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 生成地图数据（0=可走，1=障碍）
    this.generateMap();
    
    // 绘制地图
    this.drawMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 添加点击事件
    this.input.on('pointerdown', this.onMapClick, this);
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatus();
  }

  generateMap() {
    // 初始化地图为全部可走
    for (let y = 0; y < this.mapSize; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        this.mapData[y][x] = 0;
      }
    }
    
    // 随机生成 30% 障碍物
    const totalTiles = this.mapSize * this.mapSize;
    const obstacleCount = Math.floor(totalTiles * 0.3);
    
    let placed = 0;
    while (placed < obstacleCount) {
      const x = Phaser.Math.Between(0, this.mapSize - 1);
      const y = Phaser.Math.Between(0, this.mapSize - 1);
      
      // 确保起点(0,0)不是障碍
      if ((x === 0 && y === 0) || this.mapData[y][x] === 1) {
        continue;
      }
      
      this.mapData[y][x] = 1;
      placed++;
    }
  }

  drawMap() {
    this.tiles = [];
    const offsetX = (800 - this.mapSize * this.tileSize) / 2;
    const offsetY = (600 - this.mapSize * this.tileSize) / 2;
    
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const px = offsetX + x * this.tileSize;
        const py = offsetY + y * this.tileSize;
        
        const graphics = this.add.graphics();
        
        if (this.mapData[y][x] === 0) {
          // 可走地砖（浅灰色）
          graphics.fillStyle(0xcccccc, 1);
          graphics.fillRect(px, py, this.tileSize - 2, this.tileSize - 2);
        } else {
          // 障碍物（深灰色）
          graphics.fillStyle(0x333333, 1);
          graphics.fillRect(px, py, this.tileSize - 2, this.tileSize - 2);
        }
        
        // 网格边框
        graphics.lineStyle(2, 0x666666, 1);
        graphics.strokeRect(px, py, this.tileSize - 2, this.tileSize - 2);
        
        this.tiles[y][x] = { graphics, px, py };
      }
    }
  }

  createPlayer() {
    const offsetX = (800 - this.mapSize * this.tileSize) / 2;
    const offsetY = (600 - this.mapSize * this.tileSize) / 2;
    
    const px = offsetX + this.playerPos.x * this.tileSize + this.tileSize / 2;
    const py = offsetY + this.playerPos.y * this.tileSize + this.tileSize / 2;
    
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, 30);
    this.player.setPosition(px, py);
  }

  onMapClick(pointer) {
    if (this.isMoving) return;
    
    const offsetX = (800 - this.mapSize * this.tileSize) / 2;
    const offsetY = (600 - this.mapSize * this.tileSize) / 2;
    
    // 计算点击的格子坐标
    const gridX = Math.floor((pointer.x - offsetX) / this.tileSize);
    const gridY = Math.floor((pointer.y - offsetY) / this.tileSize);
    
    // 检查有效性
    if (gridX < 0 || gridX >= this.mapSize || gridY < 0 || gridY >= this.mapSize) {
      return;
    }
    
    if (this.mapData[gridY][gridX] === 1) {
      console.log('Cannot move to obstacle');
      return;
    }
    
    // 寻路
    this.path = this.findPath(this.playerPos, { x: gridX, y: gridY });
    
    if (this.path.length > 0) {
      this.moveAlongPath();
    } else {
      console.log('No path found');
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
      
      // 检查邻居节点
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (closedList.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          continue;
        }
        
        const g = current.g + 1;
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          neighbor.g = g;
          neighbor.h = this.heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openList.push(neighbor);
        } else if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }
    
    return []; // 无路径
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
      
      if (x >= 0 && x < this.mapSize && y >= 0 && y < this.mapSize && this.mapData[y][x] === 0) {
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
    
    const offsetX = (800 - this.mapSize * this.tileSize) / 2;
    const offsetY = (600 - this.mapSize * this.tileSize) / 2;
    
    const targetX = offsetX + nextPos.x * this.tileSize + this.tileSize / 2;
    const targetY = offsetY + nextPos.y * this.tileSize + this.tileSize / 2;
    
    this.tweens.add({
      targets: this.player,
      x: targetX,
      y: targetY,
      duration: 300,
      onComplete: () => {
        this.playerPos = nextPos;
        this.moveCount++;
        this.updateStatus();
        this.moveAlongPath();
      }
    });
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.playerPos.x}, ${this.playerPos.y})\n` +
      `Moves: ${this.moveCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);