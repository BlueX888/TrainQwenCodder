class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 5;
    this.cellSize = 80;
    this.wallThickness = 4;
    this.currentSeed = null;
    this.mazeGrid = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成初始 seed（基于时间戳）
    this.currentSeed = Date.now().toString().slice(-8);
    
    // 设置随机种子
    this.game.config.seed = [this.currentSeed];
    Phaser.Math.RND.init([this.currentSeed]);
    
    // 显示 seed 信息
    this.seedText = this.add.text(10, 10, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateSeedDisplay();
    
    // 显示控制提示
    this.add.text(10, 50, 'Press R: Regenerate maze', {
      fontSize: '16px',
      color: '#cccccc'
    });
    
    // 创建迷宫
    this.generateMaze();
    this.drawMaze();
    
    // 添加键盘输入
    this.input.keyboard.on('keydown-R', () => {
      this.regenerateMaze();
    });
    
    // 状态信号（可验证）
    this.generationCount = 1;
    this.statusText = this.add.text(10, 560, `Generation: ${this.generationCount}`, {
      fontSize: '16px',
      color: '#00ff00'
    });
  }

  updateSeedDisplay() {
    this.seedText.setText(`Seed: ${this.currentSeed}`);
  }

  regenerateMaze() {
    // 生成新 seed
    this.currentSeed = Date.now().toString().slice(-8);
    this.game.config.seed = [this.currentSeed];
    Phaser.Math.RND.init([this.currentSeed]);
    
    this.updateSeedDisplay();
    this.generationCount++;
    this.statusText.setText(`Generation: ${this.generationCount}`);
    
    // 清除旧迷宫
    if (this.mazeGraphics) {
      this.mazeGraphics.destroy();
    }
    
    // 生成新迷宫
    this.generateMaze();
    this.drawMaze();
  }

  generateMaze() {
    // 初始化网格：每个单元格包含四面墙 [top, right, bottom, left]
    this.mazeGrid = [];
    for (let y = 0; y < this.mazeSize; y++) {
      this.mazeGrid[y] = [];
      for (let x = 0; x < this.mazeSize; x++) {
        this.mazeGrid[y][x] = {
          walls: [true, true, true, true], // 上右下左
          visited: false
        };
      }
    }
    
    // 使用深度优先搜索生成迷宫
    const stack = [];
    let currentX = 0;
    let currentY = 0;
    this.mazeGrid[currentY][currentX].visited = true;
    
    while (true) {
      // 获取未访问的邻居
      const neighbors = this.getUnvisitedNeighbors(currentX, currentY);
      
      if (neighbors.length > 0) {
        // 随机选择一个邻居
        const nextCell = neighbors[Phaser.Math.RND.between(0, neighbors.length - 1)];
        
        // 压栈当前位置
        stack.push({ x: currentX, y: currentY });
        
        // 移除两个单元格之间的墙
        this.removeWall(currentX, currentY, nextCell.x, nextCell.y);
        
        // 移动到下一个单元格
        currentX = nextCell.x;
        currentY = nextCell.y;
        this.mazeGrid[currentY][currentX].visited = true;
      } else if (stack.length > 0) {
        // 回溯
        const cell = stack.pop();
        currentX = cell.x;
        currentY = cell.y;
      } else {
        // 完成
        break;
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
    
    for (const dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      if (nx >= 0 && nx < this.mazeSize && 
          ny >= 0 && ny < this.mazeSize && 
          !this.mazeGrid[ny][nx].visited) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    
    return neighbors;
  }

  removeWall(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    if (dy === -1) { // 向上
      this.mazeGrid[y1][x1].walls[0] = false; // 移除当前单元格的上墙
      this.mazeGrid[y2][x2].walls[2] = false; // 移除邻居单元格的下墙
    } else if (dx === 1) { // 向右
      this.mazeGrid[y1][x1].walls[1] = false;
      this.mazeGrid[y2][x2].walls[3] = false;
    } else if (dy === 1) { // 向下
      this.mazeGrid[y1][x1].walls[2] = false;
      this.mazeGrid[y2][x2].walls[0] = false;
    } else if (dx === -1) { // 向左
      this.mazeGrid[y1][x1].walls[3] = false;
      this.mazeGrid[y2][x2].walls[1] = false;
    }
  }

  drawMaze() {
    this.mazeGraphics = this.add.graphics();
    this.mazeGraphics.lineStyle(this.wallThickness, 0x2196F3, 1);
    
    const offsetX = 150;
    const offsetY = 100;
    
    // 绘制外边框
    this.mazeGraphics.strokeRect(
      offsetX,
      offsetY,
      this.mazeSize * this.cellSize,
      this.mazeSize * this.cellSize
    );
    
    // 绘制内部墙壁
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.mazeGrid[y][x];
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        
        // 上墙
        if (cell.walls[0] && y > 0) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX, cellY);
          this.mazeGraphics.lineTo(cellX + this.cellSize, cellY);
          this.mazeGraphics.strokePath();
        }
        
        // 右墙
        if (cell.walls[1] && x < this.mazeSize - 1) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX + this.cellSize, cellY);
          this.mazeGraphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          this.mazeGraphics.strokePath();
        }
        
        // 下墙
        if (cell.walls[2] && y < this.mazeSize - 1) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX, cellY + this.cellSize);
          this.mazeGraphics.lineTo(cellX + this.cellSize, cellY + this.cellSize);
          this.mazeGraphics.strokePath();
        }
        
        // 左墙
        if (cell.walls[3] && x > 0) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(cellX, cellY);
          this.mazeGraphics.lineTo(cellX, cellY + this.cellSize);
          this.mazeGraphics.strokePath();
        }
      }
    }
    
    // 绘制起点和终点
    this.mazeGraphics.fillStyle(0x4CAF50, 1);
    this.mazeGraphics.fillCircle(
      offsetX + this.cellSize / 2,
      offsetY + this.cellSize / 2,
      15
    );
    
    this.mazeGraphics.fillStyle(0xF44336, 1);
    this.mazeGraphics.fillCircle(
      offsetX + (this.mazeSize - 0.5) * this.cellSize,
      offsetY + (this.mazeSize - 0.5) * this.cellSize,
      15
    );
    
    // 添加标签
    this.add.text(offsetX + this.cellSize / 2, offsetY + this.cellSize / 2, 'S', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(
      offsetX + (this.mazeSize - 0.5) * this.cellSize,
      offsetY + (this.mazeSize - 0.5) * this.cellSize,
      'E',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: MazeScene
};

new Phaser.Game(config);