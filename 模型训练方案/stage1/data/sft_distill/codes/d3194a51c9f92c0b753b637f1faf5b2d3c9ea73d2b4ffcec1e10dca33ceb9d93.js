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
    const startNode = { x: startX, y: startY, g: 0, h: 0, f: 0, parent: null };
    
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
      if (current.x === endX && current.y === endY) {
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift({ x: temp.x, y: temp.y });
          temp = temp.parent;
        }
        return path;
      }
      
      // 移到关闭列表
      openList.splice(currentIndex, 1);
      closedList.add(`${current.x},${current.y}`);
      
      // 检查相邻节点
      const neighbors = [
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 }
      ];
      
      for (const neighbor of neighbors) {
        const { x, y } = neighbor;
        
        // 检查边界和障碍物
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) continue;
        if (this.grid[y][x] === 1) continue;
        if (closedList.has(`${x},${y}`)) continue;
        
        const g = current.g + 1;
        const h = Math.abs(x - endX) + Math.abs(y - endY);
        const f = g + h;
        
        // 检查是否已在开放列表中
        const existingIndex = openList.findIndex(node => node.x === x && node.y === y);
        
        if (existingIndex === -1) {
          openList.push({ x, y, g, h, f, parent: current });
        } else if (g < openList[existingIndex].g) {
          openList[existingIndex].g = g;
          openList[existingIndex].f = f;
          openList[existingIndex].parent = current;
        }
      }
    }
    
    return null; // 无路径
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.gridSize = 8;
    this.tileSize = 64;
    this.obstacleRate = 0.3;
    this.moveSteps = 0; // 状态信号：移动步数
    this.playerGridX = 0; // 状态信号：玩家网格X
    this.playerGridY = 0; // 状态信号：玩家网格Y
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成地板纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0x8b7355, 1);
    floorGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.lineStyle(2, 0x654321, 1);
    floorGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.generateTexture('floor', this.tileSize, this.tileSize);
    floorGraphics.destroy();

    // 生成墙壁纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    wallGraphics.lineStyle(2, 0x000000, 1);
    wallGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    wallGraphics.fillStyle(0x555555, 1);
    wallGraphics.fillRect(8, 8, this.tileSize - 16, this.tileSize - 16);
    wallGraphics.generateTexture('wall', this.tileSize, this.tileSize);
    wallGraphics.destroy();

    // 生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.lineStyle(3, 0x00aa00, 1);
    playerGraphics.strokeCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();

    // 创建地图数据
    this.mapData = [];
    for (let y = 0; y < this.gridSize; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        // 随机生成障碍物（30%概率）
        this.mapData[y][x] = Math.random() < this.obstacleRate ? 1 : 0;
      }
    }

    // 确保起点和终点可行走
    this.mapData[0][0] = 0;
    this.mapData[this.gridSize - 1][this.gridSize - 1] = 0;

    // 创建 Tilemap
    const map = this.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: this.gridSize,
      height: this.gridSize
    });

    const tiles = map.addTilesetImage('tiles', null, this.tileSize, this.tileSize);
    const layer = map.createBlankLayer('layer1', tiles, 0, 0);

    // 填充地图
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const tile = layer.putTileAt(this.mapData[y][x], x, y);
        if (this.mapData[y][x] === 0) {
          tile.setTexture('floor');
        } else {
          tile.setTexture('wall');
        }
      }
    }

    // 创建玩家
    this.playerGridX = 0;
    this.playerGridY = 0;
    this.player = this.add.sprite(
      this.tileSize / 2,
      this.tileSize / 2,
      'player'
    );

    // 初始化寻路器
    this.pathFinder = new PathFinder(this.mapData);

    // 点击事件
    this.input.on('pointerdown', (pointer) => {
      const gridX = Math.floor(pointer.x / this.tileSize);
      const gridY = Math.floor(pointer.y / this.tileSize);

      // 检查点击位置是否有效
      if (gridX >= 0 && gridX < this.gridSize && 
          gridY >= 0 && gridY < this.gridSize && 
          this.mapData[gridY][gridX] === 0) {
        
        const path = this.pathFinder.findPath(
          this.playerGridX, this.playerGridY,
          gridX, gridY
        );

        if (path && path.length > 1) {
          this.moveAlongPath(path);
        }
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, this.gridSize * this.tileSize + 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatus();

    // 添加提示文本
    this.add.text(10, this.gridSize * this.tileSize + 50, 
      '点击空白格子移动玩家', {
      fontSize: '16px',
      color: '#ffff00'
    });
  }

  moveAlongPath(path) {
    if (this.isMoving) return;
    this.isMoving = true;

    let index = 1; // 跳过起点

    const moveNext = () => {
      if (index >= path.length) {
        this.isMoving = false;
        return;
      }

      const target = path[index];
      this.playerGridX = target.x;
      this.playerGridY = target.y;
      this.moveSteps++;

      this.tweens.add({
        targets: this.player,
        x: target.x * this.tileSize + this.tileSize / 2,
        y: target.y * this.tileSize + this.tileSize / 2,
        duration: 200,
        onComplete: () => {
          index++;
          this.updateStatus();
          moveNext();
        }
      });
    };

    moveNext();
  }

  updateStatus() {
    this.statusText.setText(
      `位置: (${this.playerGridX}, ${this.playerGridY}) | 移动步数: ${this.moveSteps}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 8 * 64,
  height: 8 * 64 + 100,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);