class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeWidth = 10;
    this.mazeHeight = 10;
    this.cellSize = 50;
    this.seed = null;
    this.maze = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成或使用固定的 seed
    this.seed = this.game.config.seed || Date.now();
    
    // 初始化随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed.toString()]);
    
    // 生成迷宫
    this.maze = this.generateMaze(this.mazeWidth, this.mazeHeight);
    
    // 绘制迷宫
    this.drawMaze();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 输出可验证的状态信号
    this.exportSignals();
  }

  generateMaze(width, height) {
    // 初始化迷宫网格，每个单元格包含四面墙
    const maze = [];
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          visited: false,
          walls: {
            top: true,
            right: true,
            bottom: true,
            left: true
          }
        };
      }
    }

    // 使用深度优先搜索生成迷宫
    const stack = [];
    let currentX = 0;
    let currentY = 0;
    maze[currentY][currentX].visited = true;
    let visitedCount = 1;
    const totalCells = width * height;

    while (visitedCount < totalCells) {
      // 获取未访问的邻居
      const neighbors = this.getUnvisitedNeighbors(maze, currentX, currentY, width, height);

      if (neighbors.length > 0) {
        // 随机选择一个邻居
        const nextIndex = Math.floor(this.rnd.frac() * neighbors.length);
        const next = neighbors[nextIndex];

        // 压入当前位置到栈
        stack.push({ x: currentX, y: currentY });

        // 移除当前单元格和选中邻居之间的墙
        this.removeWalls(maze, currentX, currentY, next.x, next.y);

        // 移动到选中的邻居
        currentX = next.x;
        currentY = next.y;
        maze[currentY][currentX].visited = true;
        visitedCount++;
      } else if (stack.length > 0) {
        // 回溯
        const previous = stack.pop();
        currentX = previous.x;
        currentY = previous.y;
      }
    }

    return maze;
  }

  getUnvisitedNeighbors(maze, x, y, width, height) {
    const neighbors = [];
    
    // 上
    if (y > 0 && !maze[y - 1][x].visited) {
      neighbors.push({ x: x, y: y - 1, direction: 'top' });
    }
    // 右
    if (x < width - 1 && !maze[y][x + 1].visited) {
      neighbors.push({ x: x + 1, y: y, direction: 'right' });
    }
    // 下
    if (y < height - 1 && !maze[y + 1][x].visited) {
      neighbors.push({ x: x, y: y + 1, direction: 'bottom' });
    }
    // 左
    if (x > 0 && !maze[y][x - 1].visited) {
      neighbors.push({ x: x - 1, y: y, direction: 'left' });
    }

    return neighbors;
  }

  removeWalls(maze, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 1) {
      // 向右移动
      maze[y1][x1].walls.right = false;
      maze[y2][x2].walls.left = false;
    } else if (dx === -1) {
      // 向左移动
      maze[y1][x1].walls.left = false;
      maze[y2][x2].walls.right = false;
    } else if (dy === 1) {
      // 向下移动
      maze[y1][x1].walls.bottom = false;
      maze[y2][x2].walls.top = false;
    } else if (dy === -1) {
      // 向上移动
      maze[y1][x1].walls.top = false;
      maze[y2][x2].walls.bottom = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 50;
    const offsetY = 100;

    // 绘制背景
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(
      offsetX,
      offsetY,
      this.mazeWidth * this.cellSize,
      this.mazeHeight * this.cellSize
    );

    // 绘制墙壁
    graphics.lineStyle(2, 0x000000, 1);

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;

        // 绘制上墙
        if (cell.walls.top) {
          graphics.beginPath();
          graphics.moveTo(cellX, cellY);
          graphics.lineTo(cellX + this.cellSize, cellY);
          graphics.strokePath();
        }

        // 绘制右墙
        if (cell.walls.right) {
          graphics.beginPath();
          graphics.moveTo(cellX + this.cellSize, cellY);
          graphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          graphics.strokePath();
        }

        // 绘制下墙
        if (cell.walls.bottom) {
          graphics.beginPath();
          graphics.moveTo(cellX, cellY + this.cellSize);
          graphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          graphics.strokePath();
        }

        // 绘制左墙
        if (cell.walls.left) {
          graphics.beginPath();
          graphics.moveTo(cellX, cellY);
          graphics.lineTo(cellX, cellY + this.cellSize);
          graphics.strokePath();
        }
      }
    }

    // 标记起点（绿色）
    graphics.fillStyle(0x00ff00, 0.5);
    graphics.fillRect(offsetX + 5, offsetY + 5, this.cellSize - 10, this.cellSize - 10);

    // 标记终点（红色）
    graphics.fillStyle(0xff0000, 0.5);
    graphics.fillRect(
      offsetX + (this.mazeWidth - 1) * this.cellSize + 5,
      offsetY + (this.mazeHeight - 1) * this.cellSize + 5,
      this.cellSize - 10,
      this.cellSize - 10
    );
  }

  displaySeedInfo() {
    // 显示 seed 信息
    const seedText = this.add.text(50, 20, `Seed: ${this.seed}`, {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    });

    // 显示说明
    const infoText = this.add.text(50, 50, 'Green = Start | Red = End', {
      fontSize: '16px',
      color: '#666666'
    });

    // 显示迷宫尺寸
    const sizeText = this.add.text(400, 20, `Maze: ${this.mazeWidth}x${this.mazeHeight}`, {
      fontSize: '20px',
      color: '#000000'
    });
  }

  exportSignals() {
    // 计算迷宫统计信息
    let wallCount = 0;
    let pathCount = 0;

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        if (cell.walls.top) wallCount++;
        if (cell.walls.right) wallCount++;
        if (cell.walls.bottom) wallCount++;
        if (cell.walls.left) wallCount++;
      }
    }

    // 计算路径数（移除的墙壁数）
    const totalPossibleWalls = this.mazeWidth * this.mazeHeight * 4;
    pathCount = totalPossibleWalls - wallCount;

    // 输出可验证的状态信号
    window.__signals__ = {
      seed: this.seed,
      mazeWidth: this.mazeWidth,
      mazeHeight: this.mazeHeight,
      totalCells: this.mazeWidth * this.mazeHeight,
      wallCount: wallCount,
      pathCount: pathCount,
      startPosition: { x: 0, y: 0 },
      endPosition: { x: this.mazeWidth - 1, y: this.mazeHeight - 1 },
      mazeStructure: this.serializeMaze(),
      timestamp: Date.now()
    };

    console.log('Maze Generated:', JSON.stringify(window.__signals__, null, 2));
  }

  serializeMaze() {
    // 序列化迷宫结构以便验证
    const serialized = [];
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        serialized.push({
          x: x,
          y: y,
          walls: {
            top: cell.walls.top ? 1 : 0,
            right: cell.walls.right ? 1 : 0,
            bottom: cell.walls.bottom ? 1 : 0,
            left: cell.walls.left ? 1 : 0
          }
        });
      }
    }
    return serialized;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 700,
  backgroundColor: '#f0f0f0',
  scene: MazeScene,
  seed: ['12345'] // 可以修改这个值来生成不同的迷宫，或注释掉使用随机 seed
};

// 创建游戏实例
const game = new Phaser.Game(config);