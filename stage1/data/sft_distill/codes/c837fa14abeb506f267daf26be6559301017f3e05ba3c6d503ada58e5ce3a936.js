// A* 寻路算法实现
class PathFinder {
  constructor(grid) {
    this.grid = grid;
    this.rows = grid.length;
    this.cols = grid[0].length;
  }

  findPath(startX, startY, endX, endY) {
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${startX},${startY}`;
    const endKey = `${endX},${endY}`;

    openList.push({ x: startX, y: startY });
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startX, startY, endX, endY));

    while (openList.length > 0) {
      // 找到 fScore 最小的节点
      openList.sort((a, b) => {
        const aKey = `${a.x},${a.y}`;
        const bKey = `${b.x},${b.y}`;
        return fScore.get(aKey) - fScore.get(bKey);
      });

      const current = openList.shift();
      const currentKey = `${current.x},${current.y}`;

      if (currentKey === endKey) {
        return this.reconstructPath(cameFrom, current);
      }

      closedList.add(currentKey);

      const neighbors = this.getNeighbors(current.x, current.y);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (closedList.has(neighborKey)) continue;

        const tentativeGScore = gScore.get(currentKey) + 1;

        if (!openList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openList.push(neighbor);
        } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
          continue;
        }

        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor.x, neighbor.y, endX, endY));
      }
    }

    return []; // 无路径
  }

  heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  getNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];

    for (const dir of directions) {
      const newX = x + dir.dx;
      const newY = y + dir.dy;

      if (newX >= 0 && newX < this.cols && 
          newY >= 0 && newY < this.rows && 
          this.grid[newY][newX] === 0) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

  reconstructPath(cameFrom, current) {
    const path = [current];
    let currentKey = `${current.x},${current.y}`;

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey);
      path.unshift(current);
      currentKey = `${current.x},${current.y}`;
    }

    return path;
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 20;
    this.tileSize = 30;
    this.obstacleRate = 0.3;
    
    // 状态信号
    this.moveCount = 0;
    this.pathLength = 0;
    this.playerPos = { x: 0, y: 0 };
    this.isMoving = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成地图数据（0=可走，1=障碍）
    this.mapData = this.generateMap();
    
    // 绘制地图
    this.drawMap();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建路径显示图层
    this.pathGraphics = this.add.graphics();
    
    // 创建UI文本
    this.createUI();
    
    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);
    
    console.log('游戏状态初始化:', {
      moveCount: this.moveCount,
      playerPos: this.playerPos,
      mapSize: `${this.mapSize}x${this.mapSize}`
    });
  }

  generateMap() {
    const map = [];
    
    // 初始化全部为可走地块
    for (let y = 0; y < this.mapSize; y++) {
      map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        map[y][x] = 0;
      }
    }
    
    // 随机放置障碍物（确保起点不是障碍）
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        if (x === 0 && y === 0) continue; // 保护起点
        if (Math.random() < this.obstacleRate) {
          map[y][x] = 1;
        }
      }
    }
    
    return map;
  }

  drawMap() {
    this.mapGraphics = this.add.graphics();
    
    for (let y = 0; y < this.mapSize; y++) {
      for (let x = 0; x < this.mapSize; x++) {
        const px = x * this.tileSize;
        const py = y * this.tileSize;
        
        if (this.mapData[y][x] === 1) {
          // 障碍物 - 深灰色
          this.mapGraphics.fillStyle(0x333333, 1);
        } else {
          // 地板 - 浅灰色
          this.mapGraphics.fillStyle(0xcccccc, 1);
        }
        
        this.mapGraphics.fillRect(px, py, this.tileSize, this.tileSize);
        
        // 绘制网格线
        this.mapGraphics.lineStyle(1, 0x999999, 0.3);
        this.mapGraphics.strokeRect(px, py, this.tileSize, this.tileSize);
      }
    }
  }

  createPlayer() {
    // 玩家起始位置 (0, 0)
    this.playerPos = { x: 0, y: 0 };
    
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, this.tileSize * 0.4);
    graphics.generateTexture('player', this.tileSize, this.tileSize);
    graphics.destroy();
    
    this.player = this.add.sprite(
      this.tileSize / 2,
      this.tileSize / 2,
      'player'
    );
  }

  createUI() {
    this.uiText = this.add.text(10, this.mapSize * this.tileSize + 10, '', {
      fontSize: '16px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });
    
    this.updateUI();
  }

  updateUI() {
    this.uiText.setText([
      `移动次数: ${this.moveCount}`,
      `当前位置: (${this.playerPos.x}, ${this.playerPos.y})`,
      `路径长度: ${this.pathLength}`,
      `状态: ${this.isMoving ? '移动中' : '待命'}`
    ]);
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    // 转换点击坐标为地图坐标
    const tileX = Math.floor(pointer.x / this.tileSize);
    const tileY = Math.floor(pointer.y / this.tileSize);
    
    // 检查点击是否在地图范围内
    if (tileX < 0 || tileX >= this.mapSize || 
        tileY < 0 || tileY >= this.mapSize) {
      return;
    }
    
    // 检查目标是否是障碍物
    if (this.mapData[tileY][tileX] === 1) {
      console.log('目标是障碍物，无法移动');
      return;
    }
    
    // 寻路
    const pathFinder = new PathFinder(this.mapData);
    const path = pathFinder.findPath(
      this.playerPos.x,
      this.playerPos.y,
      tileX,
      tileY
    );
    
    if (path.length === 0) {
      console.log('无法到达目标位置');
      return;
    }
    
    // 绘制路径
    this.drawPath(path);
    
    // 移动玩家
    this.moveAlongPath(path);
  }

  drawPath(path) {
    this.pathGraphics.clear();
    this.pathGraphics.lineStyle(3, 0xff0000, 0.5);
    
    if (path.length < 2) return;
    
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(
      path[0].x * this.tileSize + this.tileSize / 2,
      path[0].y * this.tileSize + this.tileSize / 2
    );
    
    for (let i = 1; i < path.length; i++) {
      this.pathGraphics.lineTo(
        path[i].x * this.tileSize + this.tileSize / 2,
        path[i].y * this.tileSize + this.tileSize / 2
      );
    }
    
    this.pathGraphics.strokePath();
  }

  moveAlongPath(path) {
    if (path.length <= 1) return;
    
    this.isMoving = true;
    this.pathLength = path.length - 1;
    this.updateUI();
    
    let currentIndex = 1;
    const moveSpeed = 200; // 每步移动时间(ms)
    
    const moveNext = () => {
      if (currentIndex >= path.length) {
        this.isMoving = false;
        this.pathGraphics.clear();
        this.updateUI();
        console.log('移动完成，状态:', {
          moveCount: this.moveCount,
          finalPos: this.playerPos
        });
        return;
      }
      
      const target = path[currentIndex];
      this.playerPos.x = target.x;
      this.playerPos.y = target.y;
      
      this.tweens.add({
        targets: this.player,
        x: target.x * this.tileSize + this.tileSize / 2,
        y: target.y * this.tileSize + this.tileSize / 2,
        duration: moveSpeed,
        onComplete: () => {
          currentIndex++;
          this.moveCount++;
          this.updateUI();
          moveNext();
        }
      });
    };
    
    moveNext();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 650,
  backgroundColor: '#eeeeee',
  scene: GameScene
};

new Phaser.Game(config);