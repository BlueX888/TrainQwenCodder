class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 15;
    this.cellSize = 30;
    this.wallThickness = 3;
    this.maze = [];
    this.currentSeed = null;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 获取或生成 seed
    this.currentSeed = this.game.config.seed || Date.now();
    
    // 设置随机数生成器的种子
    Phaser.Math.RND.sow([this.currentSeed.toString()]);
    
    // 初始化迷宫数据结构
    this.initMaze();
    
    // 生成迷宫
    this.generateMaze(0, 0);
    
    // 绘制迷宫
    this.drawMaze();
    
    // 显示 seed 信息
    this.displayInfo();
    
    // 状态信号
    this.mazeGenerated = true;
    this.startPos = { x: 0, y: 0 };
    this.endPos = { x: this.mazeSize - 1, y: this.mazeSize - 1 };
    
    console.log('Maze generated with seed:', this.currentSeed);
    console.log('Maze generation complete:', this.mazeGenerated);
  }

  initMaze() {
    // 初始化迷宫：每个单元格有四面墙 [top, right, bottom, left]
    this.maze = [];
    for (let y = 0; y < this.mazeSize; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.mazeSize; x++) {
        this.maze[y][x] = {
          walls: [true, true, true, true], // 上右下左
          visited: false
        };
      }
    }
  }

  generateMaze(x, y) {
    // 深度优先搜索生成迷宫
    this.maze[y][x].visited = true;
    
    // 四个方向：上、右、下、左
    const directions = [
      { dx: 0, dy: -1, wall: 0, opposite: 2 }, // 上
      { dx: 1, dy: 0, wall: 1, opposite: 3 },  // 右
      { dx: 0, dy: 1, wall: 2, opposite: 0 },  // 下
      { dx: -1, dy: 0, wall: 3, opposite: 1 }  // 左
    ];
    
    // 随机打乱方向
    Phaser.Utils.Array.Shuffle(directions);
    
    for (let dir of directions) {
      const nx = x + dir.dx;
      const ny = y + dir.dy;
      
      // 检查新位置是否有效且未访问
      if (nx >= 0 && nx < this.mazeSize && 
          ny >= 0 && ny < this.mazeSize && 
          !this.maze[ny][nx].visited) {
        
        // 移除当前单元格和相邻单元格之间的墙
        this.maze[y][x].walls[dir.wall] = false;
        this.maze[ny][nx].walls[dir.opposite] = false;
        
        // 递归访问相邻单元格
        this.generateMaze(nx, ny);
      }
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 50;
    const offsetY = 80;
    
    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      offsetX - 5, 
      offsetY - 5, 
      this.mazeSize * this.cellSize + 10, 
      this.mazeSize * this.cellSize + 10
    );
    
    // 绘制通道（白色）
    graphics.fillStyle(0xffffff, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        graphics.fillRect(px, py, this.cellSize, this.cellSize);
      }
    }
    
    // 绘制墙壁（黑色）
    graphics.fillStyle(0x000000, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        const cell = this.maze[y][x];
        
        // 上墙
        if (cell.walls[0]) {
          graphics.fillRect(px, py, this.cellSize, this.wallThickness);
        }
        // 右墙
        if (cell.walls[1]) {
          graphics.fillRect(
            px + this.cellSize - this.wallThickness, 
            py, 
            this.wallThickness, 
            this.cellSize
          );
        }
        // 下墙
        if (cell.walls[2]) {
          graphics.fillRect(
            px, 
            py + this.cellSize - this.wallThickness, 
            this.cellSize, 
            this.wallThickness
          );
        }
        // 左墙
        if (cell.walls[3]) {
          graphics.fillRect(px, py, this.wallThickness, this.cellSize);
        }
      }
    }
    
    // 绘制起点（绿色）
    graphics.fillStyle(0x00ff00, 0.6);
    graphics.fillRect(
      offsetX + 2, 
      offsetY + 2, 
      this.cellSize - 4, 
      this.cellSize - 4
    );
    
    // 绘制终点（红色）
    graphics.fillStyle(0xff0000, 0.6);
    graphics.fillRect(
      offsetX + (this.mazeSize - 1) * this.cellSize + 2, 
      offsetY + (this.mazeSize - 1) * this.cellSize + 2, 
      this.cellSize - 4, 
      this.cellSize - 4
    );
  }

  displayInfo() {
    // 标题
    this.add.text(50, 20, 'Procedural Maze Generator', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    
    // 显示 seed
    this.add.text(50, 50, `Seed: ${this.currentSeed}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    
    // 显示说明
    const infoY = 80 + this.mazeSize * this.cellSize + 20;
    this.add.text(50, infoY, 'Green = Start | Red = End', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc'
    });
    
    this.add.text(50, infoY + 25, 'Maze Size: 15x15 | Algorithm: DFS', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#cccccc'
    });
    
    this.add.text(50, infoY + 50, 'Press R to regenerate with new seed', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    
    // 添加重新生成功能
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 迷宫生成后无需更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 700,
  backgroundColor: '#2d2d2d',
  scene: MazeScene,
  // 可以在这里设置固定 seed 以复现特定迷宫
  // seed: [12345]  // 取消注释并设置具体值来使用固定 seed
};

const game = new Phaser.Game(config);