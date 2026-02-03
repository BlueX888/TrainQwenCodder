// 迷宫生成游戏 - 使用 seed 生成 8x8 迷宫
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 8;
    this.cellSize = 60;
    this.wallThickness = 4;
    this.currentSeed = null;
    this.maze = null;
    this.generationComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取当前使用的 seed
    this.currentSeed = this.game.config.seed[0];
    
    // 显示标题
    this.add.text(400, 20, 'Procedural Maze Generator', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示 seed 信息
    this.seedText = this.add.text(400, 55, `Seed: ${this.currentSeed}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 显示状态信息
    this.statusText = this.add.text(400, 85, 'Status: Generating...', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 生成迷宫
    this.generateMaze();

    // 绘制迷宫
    this.drawMaze();

    // 标记起点和终点
    this.markStartAndEnd();

    // 更新状态
    this.generationComplete = true;
    this.statusText.setText('Status: Generation Complete');

    // 添加重新生成按钮说明
    this.add.text(400, 560, 'Refresh page with different seed to generate new maze', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 显示迷宫信息
    this.infoText = this.add.text(400, 540, `Maze Size: ${this.mazeSize}x${this.mazeSize} | Cells: ${this.mazeSize * this.mazeSize}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  generateMaze() {
    // 初始化迷宫网格
    // 每个单元格有四面墙：top, right, bottom, left
    this.maze = [];
    for (let y = 0; y < this.mazeSize; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.mazeSize; x++) {
        this.maze[y][x] = {
          x: x,
          y: y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false
        };
      }
    }

    // 使用深度优先搜索生成迷宫
    const stack = [];
    let currentCell = this.maze[0][0];
    currentCell.visited = true;
    let visitedCount = 1;
    const totalCells = this.mazeSize * this.mazeSize;

    while (visitedCount < totalCells) {
      // 获取未访问的邻居
      const neighbors = this.getUnvisitedNeighbors(currentCell);

      if (neighbors.length > 0) {
        // 随机选择一个邻居
        const randomIndex = Math.floor(this.game.config.rnd.frac() * neighbors.length);
        const nextCell = neighbors[randomIndex];

        // 将当前单元格压入栈
        stack.push(currentCell);

        // 移除两个单元格之间的墙
        this.removeWallBetween(currentCell, nextCell);

        // 标记下一个单元格为已访问
        nextCell.visited = true;
        visitedCount++;

        // 移动到下一个单元格
        currentCell = nextCell;
      } else if (stack.length > 0) {
        // 回溯
        currentCell = stack.pop();
      }
    }
  }

  getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { x, y } = cell;

    // 上
    if (y > 0 && !this.maze[y - 1][x].visited) {
      neighbors.push(this.maze[y - 1][x]);
    }
    // 右
    if (x < this.mazeSize - 1 && !this.maze[y][x + 1].visited) {
      neighbors.push(this.maze[y][x + 1]);
    }
    // 下
    if (y < this.mazeSize - 1 && !this.maze[y + 1][x].visited) {
      neighbors.push(this.maze[y + 1][x]);
    }
    // 左
    if (x > 0 && !this.maze[y][x - 1].visited) {
      neighbors.push(this.maze[y][x - 1]);
    }

    return neighbors;
  }

  removeWallBetween(cell1, cell2) {
    const dx = cell2.x - cell1.x;
    const dy = cell2.y - cell1.y;

    if (dx === 1) {
      // cell2 在 cell1 右边
      cell1.walls.right = false;
      cell2.walls.left = false;
    } else if (dx === -1) {
      // cell2 在 cell1 左边
      cell1.walls.left = false;
      cell2.walls.right = false;
    } else if (dy === 1) {
      // cell2 在 cell1 下边
      cell1.walls.bottom = false;
      cell2.walls.top = false;
    } else if (dy === -1) {
      // cell2 在 cell1 上边
      cell1.walls.top = false;
      cell2.walls.bottom = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 100;
    const offsetY = 120;

    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      offsetX,
      offsetY,
      this.mazeSize * this.cellSize,
      this.mazeSize * this.cellSize
    );

    // 绘制通道（白色）
    graphics.fillStyle(0xffffff, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        graphics.fillRect(
          cellX + this.wallThickness,
          cellY + this.wallThickness,
          this.cellSize - this.wallThickness * 2,
          this.cellSize - this.wallThickness * 2
        );
      }
    }

    // 绘制墙壁（黑色）
    graphics.fillStyle(0x000000, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;

        // 上墙
        if (cell.walls.top) {
          graphics.fillRect(cellX, cellY, this.cellSize, this.wallThickness);
        }
        // 右墙
        if (cell.walls.right) {
          graphics.fillRect(
            cellX + this.cellSize - this.wallThickness,
            cellY,
            this.wallThickness,
            this.cellSize
          );
        }
        // 下墙
        if (cell.walls.bottom) {
          graphics.fillRect(
            cellX,
            cellY + this.cellSize - this.wallThickness,
            this.cellSize,
            this.wallThickness
          );
        }
        // 左墙
        if (cell.walls.left) {
          graphics.fillRect(cellX, cellY, this.wallThickness, this.cellSize);
        }
      }
    }

    // 绘制外边框
    graphics.lineStyle(2, 0x666666, 1);
    graphics.strokeRect(
      offsetX,
      offsetY,
      this.mazeSize * this.cellSize,
      this.mazeSize * this.cellSize
    );
  }

  markStartAndEnd() {
    const offsetX = 100;
    const offsetY = 120;
    const graphics = this.add.graphics();

    // 起点（左上角，绿色）
    const startX = offsetX + this.cellSize / 2;
    const startY = offsetY + this.cellSize / 2;
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(startX, startY, this.cellSize / 3);
    
    this.add.text(startX, startY, 'S', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 终点（右下角，红色）
    const endX = offsetX + (this.mazeSize - 0.5) * this.cellSize;
    const endY = offsetY + (this.mazeSize - 0.5) * this.cellSize;
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(endX, endY, this.cellSize / 3);
    
    this.add.text(endX, endY, 'E', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加动画或交互逻辑
  }
}

// 生成随机 seed（可以修改这个值来生成不同的迷宫）
const randomSeed = Math.floor(Math.random() * 1000000).toString();

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: MazeScene,
  seed: [randomSeed], // 使用 seed 确保可复现
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 在控制台输出 seed 以便复现
console.log('Maze Seed:', randomSeed);
console.log('To reproduce this maze, use seed:', randomSeed);