class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeWidth = 10;
    this.mazeHeight = 10;
    this.cellSize = 50;
    this.wallThickness = 4;
    this.maze = [];
    this.currentSeed = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取当前使用的 seed
    this.currentSeed = this.game.config.seed[0];
    
    // 初始化迷宫数据结构
    this.initMaze();
    
    // 生成迷宫（使用深度优先搜索算法）
    this.generateMaze(0, 0);
    
    // 绘制迷宫
    this.drawMaze();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 标记入口和出口
    this.markEntranceAndExit();
    
    // 暴露验证信号
    this.exposeSignals();
  }

  initMaze() {
    // 初始化迷宫：每个单元格有四面墙 [上, 右, 下, 左]
    for (let y = 0; y < this.mazeHeight; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.mazeWidth; x++) {
        this.maze[y][x] = {
          walls: [true, true, true, true], // 上右下左
          visited: false
        };
      }
    }
  }

  generateMaze(startX, startY) {
    const stack = [];
    let currentX = startX;
    let currentY = startY;
    this.maze[currentY][currentX].visited = true;
    let visitedCount = 1;
    const totalCells = this.mazeWidth * this.mazeHeight;

    while (visitedCount < totalCells) {
      // 获取未访问的邻居
      const neighbors = this.getUnvisitedNeighbors(currentX, currentY);
      
      if (neighbors.length > 0) {
        // 随机选择一个邻居
        const randomIndex = Math.floor(this.rnd.frac() * neighbors.length);
        const next = neighbors[randomIndex];
        
        // 推入栈
        stack.push({ x: currentX, y: currentY });
        
        // 移除当前单元格和选中邻居之间的墙
        this.removeWall(currentX, currentY, next.x, next.y);
        
        // 移动到邻居单元格
        currentX = next.x;
        currentY = next.y;
        this.maze[currentY][currentX].visited = true;
        visitedCount++;
      } else if (stack.length > 0) {
        // 回溯
        const cell = stack.pop();
        currentX = cell.x;
        currentY = cell.y;
      }
    }
  }

  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 1, dy: 0 },  // 右
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }  // 左
    ];

    directions.forEach(dir => {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      if (nx >= 0 && nx < this.mazeWidth && 
          ny >= 0 && ny < this.mazeHeight && 
          !this.maze[ny][nx].visited) {
        neighbors.push({ x: nx, y: ny });
      }
    });

    return neighbors;
  }

  removeWall(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dy === -1) { // 上
      this.maze[y1][x1].walls[0] = false;
      this.maze[y2][x2].walls[2] = false;
    } else if (dx === 1) { // 右
      this.maze[y1][x1].walls[1] = false;
      this.maze[y2][x2].walls[3] = false;
    } else if (dy === 1) { // 下
      this.maze[y1][x1].walls[2] = false;
      this.maze[y2][x2].walls[0] = false;
    } else if (dx === -1) { // 左
      this.maze[y1][x1].walls[3] = false;
      this.maze[y2][x2].walls[1] = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 50;
    const offsetY = 100;

    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      offsetX - 10, 
      offsetY - 10, 
      this.mazeWidth * this.cellSize + 20, 
      this.mazeHeight * this.cellSize + 20
    );

    // 绘制通道
    graphics.fillStyle(0xeeeeee, 1);
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        graphics.fillRect(px, py, this.cellSize, this.cellSize);
      }
    }

    // 绘制墙壁
    graphics.lineStyle(this.wallThickness, 0x333333, 1);
    
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        const cell = this.maze[y][x];

        // 上墙
        if (cell.walls[0]) {
          graphics.lineBetween(px, py, px + this.cellSize, py);
        }
        // 右墙
        if (cell.walls[1]) {
          graphics.lineBetween(
            px + this.cellSize, py, 
            px + this.cellSize, py + this.cellSize
          );
        }
        // 下墙
        if (cell.walls[2]) {
          graphics.lineBetween(
            px, py + this.cellSize, 
            px + this.cellSize, py + this.cellSize
          );
        }
        // 左墙
        if (cell.walls[3]) {
          graphics.lineBetween(px, py, px, py + this.cellSize);
        }
      }
    }

    graphics.strokePath();
  }

  displaySeedInfo() {
    const textStyle = {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };

    this.add.text(50, 20, `Seed: ${this.currentSeed}`, textStyle);
    this.add.text(50, 50, `Maze: ${this.mazeWidth}x${this.mazeHeight}`, textStyle);
  }

  markEntranceAndExit() {
    const offsetX = 50;
    const offsetY = 100;
    const graphics = this.add.graphics();

    // 入口（左上角）- 绿色
    graphics.fillStyle(0x00ff00, 0.7);
    graphics.fillCircle(
      offsetX + this.cellSize / 2, 
      offsetY + this.cellSize / 2, 
      this.cellSize / 3
    );

    // 出口（右下角）- 红色
    graphics.fillStyle(0xff0000, 0.7);
    graphics.fillCircle(
      offsetX + (this.mazeWidth - 0.5) * this.cellSize, 
      offsetY + (this.mazeHeight - 0.5) * this.cellSize, 
      this.cellSize / 3
    );

    // 添加文字标签
    const labelStyle = {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    };

    this.add.text(
      offsetX + this.cellSize / 2, 
      offsetY + this.cellSize / 2, 
      'START', 
      labelStyle
    ).setOrigin(0.5);

    this.add.text(
      offsetX + (this.mazeWidth - 0.5) * this.cellSize, 
      offsetY + (this.mazeHeight - 0.5) * this.cellSize, 
      'END', 
      labelStyle
    ).setOrigin(0.5);
  }

  exposeSignals() {
    // 计算迷宫统计信息
    let totalWalls = 0;
    let removedWalls = 0;

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        cell.walls.forEach(hasWall => {
          totalWalls++;
          if (!hasWall) removedWalls++;
        });
      }
    }

    // 暴露验证信号
    window.__signals__ = {
      seed: this.currentSeed,
      mazeSize: `${this.mazeWidth}x${this.mazeHeight}`,
      totalCells: this.mazeWidth * this.mazeHeight,
      totalWalls: totalWalls,
      removedWalls: removedWalls,
      wallRemovalRate: (removedWalls / totalWalls * 100).toFixed(2) + '%',
      mazeGenerated: true,
      entrancePosition: { x: 0, y: 0 },
      exitPosition: { x: this.mazeWidth - 1, y: this.mazeHeight - 1 },
      timestamp: Date.now()
    };

    console.log('Maze Generation Signals:', JSON.stringify(window.__signals__, null, 2));
  }
}

// 生成随机 seed（可以修改此值来复现特定迷宫）
const randomSeed = Math.floor(Math.random() * 1000000);

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 700,
  backgroundColor: '#2d2d2d',
  seed: [randomSeed.toString()], // 设置随机种子
  scene: MazeScene
};

const game = new Phaser.Game(config);

// 输出初始 seed 到控制台
console.log(`Game initialized with seed: ${randomSeed}`);
console.log('To reproduce this maze, use seed:', randomSeed);