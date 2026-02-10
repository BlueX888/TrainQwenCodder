// 迷宫生成器类
class MazeGenerator {
  constructor(width, height, rng) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.grid = [];
    
    // 初始化网格，所有单元格都是墙
    for (let y = 0; y < height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < width; x++) {
        this.grid[y][x] = {
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true }
        };
      }
    }
  }

  // 使用 Randomized Prim 算法生成迷宫
  generate() {
    const startX = Math.floor(this.rng.frac() * this.width);
    const startY = Math.floor(this.rng.frac() * this.height);
    
    const walls = [];
    this.grid[startY][startX].visited = true;
    
    // 添加起始单元格的墙到列表
    this.addWalls(startX, startY, walls);
    
    while (walls.length > 0) {
      // 随机选择一面墙
      const wallIndex = Math.floor(this.rng.frac() * walls.length);
      const wall = walls[wallIndex];
      walls.splice(wallIndex, 1);
      
      const { x, y, direction } = wall;
      let nx = x, ny = y;
      
      // 计算墙另一边的单元格
      switch (direction) {
        case 'top': ny = y - 1; break;
        case 'right': nx = x + 1; break;
        case 'bottom': ny = y + 1; break;
        case 'left': nx = x - 1; break;
      }
      
      // 检查边界
      if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
        continue;
      }
      
      // 如果另一边的单元格未访问，则打通墙
      if (!this.grid[ny][nx].visited) {
        this.grid[y][x].walls[direction] = false;
        
        // 打通对应的另一侧墙
        const oppositeDir = {
          'top': 'bottom',
          'bottom': 'top',
          'left': 'right',
          'right': 'left'
        };
        this.grid[ny][nx].walls[oppositeDir[direction]] = false;
        
        this.grid[ny][nx].visited = true;
        this.addWalls(nx, ny, walls);
      }
    }
    
    return this.grid;
  }

  addWalls(x, y, walls) {
    const directions = ['top', 'right', 'bottom', 'left'];
    directions.forEach(dir => {
      let nx = x, ny = y;
      switch (dir) {
        case 'top': ny = y - 1; break;
        case 'right': nx = x + 1; break;
        case 'bottom': ny = y + 1; break;
        case 'left': nx = x - 1; break;
      }
      
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        if (!this.grid[ny][nx].visited) {
          walls.push({ x, y, direction: dir });
        }
      }
    });
  }
}

// 主场景
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeWidth = 20;
    this.mazeHeight = 20;
    this.cellSize = 25;
    this.seed = null;
    this.mazeGenerated = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成或使用指定的 seed
    this.seed = this.game.config.seed || Date.now();
    
    // 使用 seed 初始化随机数生成器
    const rng = new Phaser.Math.RandomDataGenerator([this.seed.toString()]);
    
    // 生成迷宫
    const generator = new MazeGenerator(this.mazeWidth, this.mazeHeight, rng);
    this.maze = generator.generate();
    this.mazeGenerated = true;
    
    // 绘制迷宫
    this.drawMaze();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 标记起点和终点
    this.markStartEnd();
    
    // 添加重新生成按钮提示
    this.addInstructions();
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 50;
    const offsetY = 80;
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(
      offsetX - 5,
      offsetY - 5,
      this.mazeWidth * this.cellSize + 10,
      this.mazeHeight * this.cellSize + 10
    );
    
    // 绘制通道（白色）
    graphics.fillStyle(0xffffff, 1);
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        graphics.fillRect(
          offsetX + x * this.cellSize + 2,
          offsetY + y * this.cellSize + 2,
          this.cellSize - 4,
          this.cellSize - 4
        );
      }
    }
    
    // 绘制墙壁（深蓝色）
    graphics.lineStyle(3, 0x0f3460, 1);
    
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        
        // 绘制墙壁
        if (cell.walls.top) {
          graphics.lineBetween(
            cellX, cellY,
            cellX + this.cellSize, cellY
          );
        }
        if (cell.walls.right) {
          graphics.lineBetween(
            cellX + this.cellSize, cellY,
            cellX + this.cellSize, cellY + this.cellSize
          );
        }
        if (cell.walls.bottom) {
          graphics.lineBetween(
            cellX, cellY + this.cellSize,
            cellX + this.cellSize, cellY + this.cellSize
          );
        }
        if (cell.walls.left) {
          graphics.lineBetween(
            cellX, cellY,
            cellX, cellY + this.cellSize
          );
        }
      }
    }
    
    graphics.strokePath();
  }

  markStartEnd() {
    const offsetX = 50;
    const offsetY = 80;
    
    // 起点（绿色）
    const startGraphics = this.add.graphics();
    startGraphics.fillStyle(0x00ff00, 0.7);
    startGraphics.fillCircle(
      offsetX + this.cellSize / 2,
      offsetY + this.cellSize / 2,
      this.cellSize / 3
    );
    
    // 终点（红色）
    const endGraphics = this.add.graphics();
    endGraphics.fillStyle(0xff0000, 0.7);
    endGraphics.fillCircle(
      offsetX + (this.mazeWidth - 1) * this.cellSize + this.cellSize / 2,
      offsetY + (this.mazeHeight - 1) * this.cellSize + this.cellSize / 2,
      this.cellSize / 3
    );
    
    // 添加标签
    this.add.text(offsetX, offsetY - 25, 'START', {
      fontSize: '14px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    
    this.add.text(
      offsetX + (this.mazeWidth - 1) * this.cellSize,
      offsetY + this.mazeHeight * this.cellSize + 10,
      'END',
      {
        fontSize: '14px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    );
  }

  displaySeedInfo() {
    // 标题
    this.add.text(50, 20, 'Procedural Maze Generator', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    
    // 显示当前 seed
    this.seedText = this.add.text(50, 50, `Seed: ${this.seed}`, {
      fontSize: '16px',
      color: '#ffcc00',
      fontStyle: 'bold'
    });
    
    // 状态信息
    this.statusText = this.add.text(400, 50, `Size: ${this.mazeWidth}x${this.mazeHeight} | Generated: ${this.mazeGenerated}`, {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  addInstructions() {
    const instructions = this.add.text(
      50,
      600,
      'Press SPACE to generate new maze | Press R to regenerate with same seed',
      {
        fontSize: '14px',
        color: '#888888'
      }
    );
    
    // 添加键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.restart();
    });
    
    this.input.keyboard.on('keydown-R', () => {
      // 使用相同的 seed 重新生成
      this.game.config.seed = this.seed;
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 可以在这里添加动画或交互逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 650,
  backgroundColor: '#16213e',
  scene: MazeScene,
  seed: null // 可以在这里设置固定 seed，如 seed: 12345
};

const game = new Phaser.Game(config);

// 状态验证变量（可通过 game.scene.scenes[0] 访问）
// - mazeGenerated: boolean - 迷宫是否已生成
// - seed: number - 当前使用的随机种子
// - mazeWidth/mazeHeight: number - 迷宫尺寸
// - maze: array - 迷宫网格数据