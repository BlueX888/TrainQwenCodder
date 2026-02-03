// 迷宫生成器类
class MazeGenerator {
  constructor(width, height, rng) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.grid = [];
    this.visited = [];
    
    // 初始化网格
    for (let y = 0; y < height; y++) {
      this.grid[y] = [];
      this.visited[y] = [];
      for (let x = 0; x < width; x++) {
        // 每个单元格有四面墙：上、右、下、左
        this.grid[y][x] = {
          top: true,
          right: true,
          bottom: true,
          left: true
        };
        this.visited[y][x] = false;
      }
    }
  }
  
  // 深度优先搜索生成迷宫
  generate() {
    const stack = [];
    const startX = 0;
    const startY = 0;
    
    this.visited[startY][startX] = true;
    stack.push({ x: startX, y: startY });
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = neighbors[Math.floor(this.rng.frac() * neighbors.length)];
        
        // 移除两个单元格之间的墙
        this.removeWall(current, next);
        
        // 标记为已访问并入栈
        this.visited[next.y][next.x] = true;
        stack.push(next);
      } else {
        // 回溯
        stack.pop();
      }
    }
  }
  
  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    
    // 上
    if (y > 0 && !this.visited[y - 1][x]) {
      neighbors.push({ x, y: y - 1, direction: 'top' });
    }
    // 右
    if (x < this.width - 1 && !this.visited[y][x + 1]) {
      neighbors.push({ x: x + 1, y, direction: 'right' });
    }
    // 下
    if (y < this.height - 1 && !this.visited[y + 1][x]) {
      neighbors.push({ x, y: y + 1, direction: 'bottom' });
    }
    // 左
    if (x > 0 && !this.visited[y][x - 1]) {
      neighbors.push({ x: x - 1, y, direction: 'left' });
    }
    
    return neighbors;
  }
  
  removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    if (dx === 1) {
      // 向右移动
      this.grid[current.y][current.x].right = false;
      this.grid[next.y][next.x].left = false;
    } else if (dx === -1) {
      // 向左移动
      this.grid[current.y][current.x].left = false;
      this.grid[next.y][next.x].right = false;
    } else if (dy === 1) {
      // 向下移动
      this.grid[current.y][current.x].bottom = false;
      this.grid[next.y][next.x].top = false;
    } else if (dy === -1) {
      // 向上移动
      this.grid[current.y][current.x].top = false;
      this.grid[next.y][next.x].bottom = false;
    }
  }
}

// 主游戏场景
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeWidth = 20;
    this.mazeHeight = 20;
    this.cellSize = 25;
    this.wallThickness = 2;
    
    // 状态信号
    this.mazeGenerated = false;
    this.totalCells = 0;
    this.seed = '';
  }
  
  preload() {
    // 无需预加载外部资源
  }
  
  create() {
    // 获取或生成 seed
    this.seed = this.game.config.seed || Date.now().toString();
    this.totalCells = this.mazeWidth * this.mazeHeight;
    
    // 显示 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    seedText.setDepth(100);
    
    // 显示迷宫信息
    const infoText = this.add.text(10, 40, `Maze: ${this.mazeWidth}x${this.mazeHeight} (${this.totalCells} cells)`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    infoText.setDepth(100);
    
    // 生成迷宫
    const rng = new Phaser.Math.RandomDataGenerator([this.seed]);
    const mazeGen = new MazeGenerator(this.mazeWidth, this.mazeHeight, rng);
    mazeGen.generate();
    
    // 绘制迷宫
    this.drawMaze(mazeGen.grid);
    
    // 标记起点和终点
    this.markStartEnd();
    
    // 添加状态文本
    const statusText = this.add.text(10, 70, 'Status: Maze Generated ✓', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    statusText.setDepth(100);
    
    this.mazeGenerated = true;
    
    // 添加重新生成按钮提示
    const hintText = this.add.text(10, 100, 'Press R to regenerate with new seed', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    hintText.setDepth(100);
    
    // 添加键盘输入
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
    
    // 居中显示迷宫
    const mazeWidth = this.mazeWidth * this.cellSize;
    const mazeHeight = this.mazeHeight * this.cellSize;
    const offsetX = (this.cameras.main.width - mazeWidth) / 2;
    const offsetY = (this.cameras.main.height - mazeHeight) / 2 + 60;
    
    this.cameras.main.scrollX = -offsetX;
    this.cameras.main.scrollY = -offsetY;
  }
  
  drawMaze(grid) {
    const graphics = this.add.graphics();
    graphics.lineStyle(this.wallThickness, 0x2196F3, 1);
    
    // 绘制背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a1a, 1);
    bgGraphics.fillRect(0, 0, this.mazeWidth * this.cellSize, this.mazeHeight * this.cellSize);
    
    // 绘制通道（浅色）
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xf5f5f5, 1);
    
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cellX = x * this.cellSize;
        const cellY = y * this.cellSize;
        
        // 绘制单元格背景
        pathGraphics.fillRect(
          cellX + this.wallThickness,
          cellY + this.wallThickness,
          this.cellSize - this.wallThickness * 2,
          this.cellSize - this.wallThickness * 2
        );
        
        const cell = grid[y][x];
        
        // 绘制墙壁
        if (cell.top) {
          graphics.lineBetween(cellX, cellY, cellX + this.cellSize, cellY);
        }
        if (cell.right) {
          graphics.lineBetween(
            cellX + this.cellSize,
            cellY,
            cellX + this.cellSize,
            cellY + this.cellSize
          );
        }
        if (cell.bottom) {
          graphics.lineBetween(
            cellX,
            cellY + this.cellSize,
            cellX + this.cellSize,
            cellY + this.cellSize
          );
        }
        if (cell.left) {
          graphics.lineBetween(cellX, cellY, cellX, cellY + this.cellSize);
        }
      }
    }
    
    graphics.strokePath();
  }
  
  markStartEnd() {
    // 标记起点（左上角，绿色）
    const startGraphics = this.add.graphics();
    startGraphics.fillStyle(0x4CAF50, 1);
    startGraphics.fillCircle(
      this.cellSize / 2,
      this.cellSize / 2,
      this.cellSize / 3
    );
    
    // 标记终点（右下角，红色）
    const endGraphics = this.add.graphics();
    endGraphics.fillStyle(0xF44336, 1);
    endGraphics.fillCircle(
      (this.mazeWidth - 0.5) * this.cellSize,
      (this.mazeHeight - 0.5) * this.cellSize,
      this.cellSize / 3
    );
    
    // 添加标签
    const startLabel = this.add.text(
      this.cellSize / 2,
      this.cellSize / 2,
      'S',
      {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    startLabel.setOrigin(0.5);
    
    const endLabel = this.add.text(
      (this.mazeWidth - 0.5) * this.cellSize,
      (this.mazeHeight - 0.5) * this.cellSize,
      'E',
      {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    endLabel.setOrigin(0.5);
  }
  
  update(time, delta) {
    // 可以在这里添加动画或其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#0a0a0a',
  scene: MazeScene,
  seed: [Date.now().toString()], // 使用时间戳作为默认 seed
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态信号用于验证
window.getMazeStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    mazeGenerated: scene.mazeGenerated,
    seed: scene.seed,
    totalCells: scene.totalCells,
    dimensions: `${scene.mazeWidth}x${scene.mazeHeight}`
  };
};