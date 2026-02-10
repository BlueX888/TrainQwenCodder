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
        this.grid[y][x] = { top: true, right: true, bottom: true, left: true };
        this.visited[y][x] = false;
      }
    }
  }
  
  // 深度优先搜索生成迷宫
  generate() {
    const stack = [];
    let currentX = 0;
    let currentY = 0;
    
    this.visited[currentY][currentX] = true;
    stack.push({ x: currentX, y: currentY });
    
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
    
    return this.grid;
  }
  
  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1, name: 'top' },    // 上
      { x: 1, y: 0, name: 'right' },   // 右
      { x: 0, y: 1, name: 'bottom' },  // 下
      { x: -1, y: 0, name: 'left' }    // 左
    ];
    
    for (const dir of directions) {
      const nx = x + dir.x;
      const ny = y + dir.y;
      
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        if (!this.visited[ny][nx]) {
          neighbors.push({ x: nx, y: ny, direction: dir.name });
        }
      }
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
    this.mazeWidth = 10;
    this.mazeHeight = 10;
    this.cellSize = 50;
    this.wallThickness = 4;
  }
  
  preload() {
    // 不需要加载外部资源
  }
  
  create() {
    // 获取或生成随机种子
    const urlParams = new URLSearchParams(window.location.search);
    this.seed = urlParams.get('seed') || Date.now().toString();
    
    // 设置随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);
    
    // 生成迷宫
    const generator = new MazeGenerator(this.mazeWidth, this.mazeHeight, this.rng);
    this.maze = generator.generate();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 显示种子信息
    this.displaySeedInfo();
    
    // 添加起点和终点标记
    this.addMarkers();
    
    // 导出可验证信号
    this.exportSignals();
    
    console.log('Maze generated with seed:', this.seed);
    console.log('URL to reproduce:', window.location.origin + window.location.pathname + '?seed=' + this.seed);
  }
  
  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 50;
    const offsetY = 100;
    
    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      offsetX - 5,
      offsetY - 5,
      this.mazeWidth * this.cellSize + 10,
      this.mazeHeight * this.cellSize + 10
    );
    
    // 绘制通道（浅色）
    graphics.fillStyle(0xf0f0f0, 1);
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        graphics.fillRect(
          offsetX + x * this.cellSize,
          offsetY + y * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }
    
    // 绘制墙壁
    graphics.lineStyle(this.wallThickness, 0x333333, 1);
    
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        
        // 绘制上墙
        if (cell.top) {
          graphics.beginPath();
          graphics.moveTo(cellX, cellY);
          graphics.lineTo(cellX + this.cellSize, cellY);
          graphics.strokePath();
        }
        
        // 绘制右墙
        if (cell.right) {
          graphics.beginPath();
          graphics.moveTo(cellX + this.cellSize, cellY);
          graphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          graphics.strokePath();
        }
        
        // 绘制下墙
        if (cell.bottom) {
          graphics.beginPath();
          graphics.moveTo(cellX, cellY + this.cellSize);
          graphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          graphics.strokePath();
        }
        
        // 绘制左墙
        if (cell.left) {
          graphics.beginPath();
          graphics.moveTo(cellX, cellY);
          graphics.lineTo(cellX, cellY + this.cellSize);
          graphics.strokePath();
        }
      }
    }
  }
  
  addMarkers() {
    const offsetX = 50;
    const offsetY = 100;
    const markerSize = this.cellSize * 0.6;
    
    // 起点（左上角，绿色）
    const startGraphics = this.add.graphics();
    startGraphics.fillStyle(0x00ff00, 0.7);
    startGraphics.fillCircle(
      offsetX + this.cellSize / 2,
      offsetY + this.cellSize / 2,
      markerSize / 2
    );
    
    // 终点（右下角，红色）
    const endGraphics = this.add.graphics();
    endGraphics.fillStyle(0xff0000, 0.7);
    endGraphics.fillCircle(
      offsetX + (this.mazeWidth - 0.5) * this.cellSize,
      offsetY + (this.mazeHeight - 0.5) * this.cellSize,
      markerSize / 2
    );
  }
  
  displaySeedInfo() {
    // 标题
    this.add.text(400, 20, 'Procedural Maze Generator', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 种子信息
    const seedText = `Seed: ${this.seed}`;
    this.add.text(400, 55, seedText, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    // 说明文字
    this.add.text(400, 620, 'Green: Start | Red: End | Copy URL with seed to reproduce', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    }).setOrigin(0.5);
  }
  
  exportSignals() {
    // 导出可验证的状态信号
    window.__signals__ = {
      seed: this.seed,
      mazeSize: {
        width: this.mazeWidth,
        height: this.mazeHeight
      },
      maze: this.maze,
      timestamp: Date.now(),
      reproducible: true,
      url: window.location.origin + window.location.pathname + '?seed=' + this.seed
    };
    
    // 输出 JSON 日志
    console.log('=== MAZE SIGNALS ===');
    console.log(JSON.stringify({
      seed: this.seed,
      mazeSize: `${this.mazeWidth}x${this.mazeHeight}`,
      cellCount: this.mazeWidth * this.mazeHeight,
      reproducibleUrl: window.__signals__.url
    }, null, 2));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 650,
  backgroundColor: '#000000',
  scene: MazeScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);