// 迷宫生成器类
class MazeGenerator {
  constructor(width, height, rng) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.grid = [];
    this.walls = [];
  }

  generate() {
    // 初始化网格，所有单元格都是墙
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = 1; // 1 表示墙，0 表示通道
      }
    }

    // 使用改进的 Prim's 算法生成迷宫
    const startX = 0;
    const startY = 0;
    this.grid[startY][startX] = 0;

    // 添加起始单元格的相邻墙
    this.addWalls(startX, startY);

    while (this.walls.length > 0) {
      // 随机选择一个墙
      const wallIndex = Math.floor(this.rng.frac() * this.walls.length);
      const wall = this.walls[wallIndex];
      this.walls.splice(wallIndex, 1);

      const [wx, wy, dx, dy] = wall;
      const nx = wx + dx;
      const ny = wy + dy;

      // 检查墙的另一侧是否是未访问的单元格
      if (this.isValid(nx, ny) && this.grid[ny][nx] === 1) {
        // 打通墙
        this.grid[wy][wx] = 0;
        this.grid[ny][nx] = 0;

        // 添加新单元格的相邻墙
        this.addWalls(nx, ny);
      }
    }

    return this.grid;
  }

  addWalls(x, y) {
    const directions = [
      [0, -1], // 上
      [1, 0],  // 右
      [0, 1],  // 下
      [-1, 0]  // 左
    ];

    for (const [dx, dy] of directions) {
      const wx = x + dx;
      const wy = y + dy;
      const nx = x + dx * 2;
      const ny = y + dy * 2;

      if (this.isValid(nx, ny) && this.grid[ny][nx] === 1) {
        this.walls.push([wx, wy, dx, dy]);
      }
    }
  }

  isValid(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}

// 主游戏场景
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeGenerated = false; // 状态信号
    this.seed = Date.now(); // 默认使用时间戳作为种子
  }

  init(data) {
    // 允许外部传入 seed
    if (data && data.seed !== undefined) {
      this.seed = data.seed;
    }
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const mazeWidth = 20;
    const mazeHeight = 20;
    const cellSize = 25;
    const wallThickness = 3;

    // 设置随机种子
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

    // 显示 seed 值
    const seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 添加说明文本
    const infoText = this.add.text(10, 45, 'Green = Start, Red = End', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setDepth(100);

    // 生成迷宫
    const generator = new MazeGenerator(mazeWidth, mazeHeight, this.rng);
    const maze = generator.generate();

    // 创建 Graphics 对象绘制迷宫
    const graphics = this.add.graphics();

    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(50, 80, mazeWidth * cellSize, mazeHeight * cellSize);

    // 绘制迷宫
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        const px = 50 + x * cellSize;
        const py = 80 + y * cellSize;

        if (maze[y][x] === 1) {
          // 绘制墙壁
          graphics.fillStyle(0x4a4a4a, 1);
          graphics.fillRect(px, py, cellSize, cellSize);
        } else {
          // 绘制通道
          graphics.fillStyle(0xf0f0f0, 1);
          graphics.fillRect(px + wallThickness, py + wallThickness, 
                          cellSize - wallThickness * 2, 
                          cellSize - wallThickness * 2);
        }
      }
    }

    // 标记起点（左上角第一个通道）
    let startX = 0, startY = 0;
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        if (maze[y][x] === 0) {
          startX = x;
          startY = y;
          break;
        }
      }
      if (maze[startY][startX] === 0) break;
    }

    // 标记终点（右下角最后一个通道）
    let endX = mazeWidth - 1, endY = mazeHeight - 1;
    for (let y = mazeHeight - 1; y >= 0; y--) {
      for (let x = mazeWidth - 1; x >= 0; x--) {
        if (maze[y][x] === 0) {
          endX = x;
          endY = y;
          break;
        }
      }
      if (maze[endY][endX] === 0) break;
    }

    // 绘制起点（绿色）
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(
      50 + startX * cellSize + cellSize / 2,
      80 + startY * cellSize + cellSize / 2,
      cellSize / 3
    );

    // 绘制终点（红色）
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(
      50 + endX * cellSize + cellSize / 2,
      80 + endY * cellSize + cellSize / 2,
      cellSize / 3
    );

    // 设置状态信号
    this.mazeGenerated = true;

    // 添加重新生成按钮
    const buttonText = this.add.text(10, 580, 'Press R to Regenerate', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    buttonText.setDepth(100);

    // 添加键盘输入
    this.input.keyboard.on('keydown-R', () => {
      this.seed = Date.now();
      this.scene.restart({ seed: this.seed });
    });

    // 输出调试信息
    console.log('Maze generated with seed:', this.seed);
    console.log('Maze generated:', this.mazeGenerated);
    console.log('Start:', startX, startY, 'End:', endX, endY);
  }

  update(time, delta) {
    // 迷宫是静态的，不需要每帧更新
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 620,
  backgroundColor: '#000000',
  scene: MazeScene,
  seed: [42] // 设置全局默认种子
};

// 创建游戏实例
const game = new Phaser.Game(config);