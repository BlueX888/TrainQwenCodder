// 迷宫生成器类
class MazeGenerator {
  constructor(width, height, rng) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.grid = [];
    this.initGrid();
  }

  initGrid() {
    // 初始化网格，所有墙壁都存在
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = {
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true }
        };
      }
    }
  }

  generate() {
    // 使用递归回溯算法生成迷宫
    const stack = [];
    let current = { x: 0, y: 0 };
    this.grid[0][0].visited = true;
    let visitedCount = 1;
    const totalCells = this.width * this.height;

    while (visitedCount < totalCells) {
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = neighbors[Math.floor(this.rng.frac() * neighbors.length)];
        
        // 移除当前单元格和邻居之间的墙
        this.removeWalls(current, next);
        
        // 标记邻居为已访问
        this.grid[next.y][next.x].visited = true;
        visitedCount++;
        
        // 将当前单元格压入栈
        stack.push(current);
        
        // 移动到邻居
        current = next;
      } else if (stack.length > 0) {
        // 回溯
        current = stack.pop();
      }
    }

    return this.grid;
  }

  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1, dir: 'top' },    // 上
      { x: 1, y: 0, dir: 'right' },   // 右
      { x: 0, y: 1, dir: 'bottom' },  // 下
      { x: -1, y: 0, dir: 'left' }    // 左
    ];

    for (const dir of directions) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        if (!this.grid[ny][nx].visited) {
          neighbors.push({ x: nx, y: ny, direction: dir.dir });
        }
      }
    }

    return neighbors;
  }

  removeWalls(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (dx === 1) {
      // 向右移动
      this.grid[current.y][current.x].walls.right = false;
      this.grid[next.y][next.x].walls.left = false;
    } else if (dx === -1) {
      // 向左移动
      this.grid[current.y][current.x].walls.left = false;
      this.grid[next.y][next.x].walls.right = false;
    } else if (dy === 1) {
      // 向下移动
      this.grid[current.y][current.x].walls.bottom = false;
      this.grid[next.y][next.x].walls.top = false;
    } else if (dy === -1) {
      // 向上移动
      this.grid[current.y][current.x].walls.top = false;
      this.grid[next.y][next.x].walls.bottom = false;
    }
  }
}

// 主游戏场景
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeWidth = 12;
    this.mazeHeight = 12;
    this.cellSize = 40;
    this.wallThickness = 4;
    this.seed = null;
    this.mazeGenerated = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取或生成 seed
    this.seed = this.game.config.seed || Date.now().toString().slice(-8);
    
    // 设置随机数生成器
    Phaser.Math.RND.sow([this.seed]);
    
    // 显示 seed 信息
    const seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 显示状态信息
    this.statusText = this.add.text(10, 45, 'Status: Generating...', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    // 生成迷宫
    this.generateMaze();

    // 添加重新生成按钮提示
    const hintText = this.add.text(10, 80, 'Press SPACE to generate new maze', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    hintText.setDepth(100);

    // 添加键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateMaze();
    });

    // 状态变量（用于验证）
    this.mazeState = {
      seed: this.seed,
      width: this.mazeWidth,
      height: this.mazeHeight,
      generated: true,
      cellCount: this.mazeWidth * this.mazeHeight
    };
  }

  generateMaze() {
    // 清除之前的图形
    if (this.mazeGraphics) {
      this.mazeGraphics.destroy();
    }

    // 创建迷宫生成器
    const generator = new MazeGenerator(
      this.mazeWidth,
      this.mazeHeight,
      Phaser.Math.RND
    );

    // 生成迷宫
    const maze = generator.generate();

    // 绘制迷宫
    this.drawMaze(maze);

    // 更新状态
    this.mazeGenerated = true;
    this.statusText.setText('Status: Maze Generated!');
    this.statusText.setColor('#00ff00');

    // 延迟后恢复状态文本颜色
    this.time.delayedCall(1000, () => {
      this.statusText.setColor('#ffffff');
    });
  }

  drawMaze(maze) {
    // 计算偏移量使迷宫居中
    const offsetX = (this.cameras.main.width - this.mazeWidth * this.cellSize) / 2;
    const offsetY = (this.cameras.main.height - this.mazeHeight * this.cellSize) / 2 + 40;

    this.mazeGraphics = this.add.graphics();

    // 绘制背景
    this.mazeGraphics.fillStyle(0x1a1a1a, 1);
    this.mazeGraphics.fillRect(
      offsetX - 10,
      offsetY - 10,
      this.mazeWidth * this.cellSize + 20,
      this.mazeHeight * this.cellSize + 20
    );

    // 绘制通道（浅色）
    this.mazeGraphics.fillStyle(0x333333, 1);
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        this.mazeGraphics.fillRect(cellX, cellY, this.cellSize, this.cellSize);
      }
    }

    // 绘制起点（绿色）
    this.mazeGraphics.fillStyle(0x00ff00, 0.5);
    this.mazeGraphics.fillRect(
      offsetX + 2,
      offsetY + 2,
      this.cellSize - 4,
      this.cellSize - 4
    );

    // 绘制终点（红色）
    this.mazeGraphics.fillStyle(0xff0000, 0.5);
    this.mazeGraphics.fillRect(
      offsetX + (this.mazeWidth - 1) * this.cellSize + 2,
      offsetY + (this.mazeHeight - 1) * this.cellSize + 2,
      this.cellSize - 4,
      this.cellSize - 4
    );

    // 绘制墙壁
    this.mazeGraphics.lineStyle(this.wallThickness, 0xffffff, 1);

    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = maze[y][x];
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;

        // 绘制上墙
        if (cell.walls.top) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX, cellY);
          this.mazeGraphics.lineTo(cellX + this.cellSize, cellY);
          this.mazeGraphics.strokePath();
        }

        // 绘制右墙
        if (cell.walls.right) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX + this.cellSize, cellY);
          this.mazeGraphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          this.mazeGraphics.strokePath();
        }

        // 绘制下墙
        if (cell.walls.bottom) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX, cellY + this.cellSize);
          this.mazeGraphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          this.mazeGraphics.strokePath();
        }

        // 绘制左墙
        if (cell.walls.left) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX, cellY);
          this.mazeGraphics.lineTo(cellX, cellY + this.cellSize);
          this.mazeGraphics.strokePath();
        }
      }
    }
  }

  regenerateMaze() {
    // 生成新的 seed
    this.seed = Date.now().toString().slice(-8);
    Phaser.Math.RND.sow([this.seed]);

    // 更新显示
    const seedText = this.children.list.find(child => 
      child.text && child.text.startsWith('Seed:')
    );
    if (seedText) {
      seedText.setText(`Seed: ${this.seed}`);
    }

    this.statusText.setText('Status: Regenerating...');
    this.statusText.setColor('#ffff00');

    // 重新生成迷宫
    this.generateMaze();

    // 更新状态变量
    this.mazeState.seed = this.seed;
  }

  update(time, delta) {
    // 每帧更新逻辑（当前不需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#000000',
  scene: MazeScene,
  // 可以设置固定 seed 以便复现：
  // seed: ['12345678']
};

// 创建游戏实例
new Phaser.Game(config);