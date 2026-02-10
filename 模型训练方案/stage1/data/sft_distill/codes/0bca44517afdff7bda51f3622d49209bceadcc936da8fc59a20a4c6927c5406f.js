// 迷宫生成器类
class MazeGenerator {
  constructor(seed, rows, cols) {
    this.seed = seed;
    this.rows = rows;
    this.cols = cols;
    this.rng = new Phaser.Math.RandomDataGenerator([seed]);
    this.grid = [];
    this.visited = [];
  }

  generate() {
    // 初始化网格，所有墙壁都存在
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      this.visited[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = {
          top: true,
          right: true,
          bottom: true,
          left: true
        };
        this.visited[r][c] = false;
      }
    }

    // 使用深度优先搜索生成迷宫
    this.dfs(0, 0);
    return this.grid;
  }

  dfs(row, col) {
    this.visited[row][col] = true;
    
    // 获取所有未访问的邻居
    const neighbors = this.getUnvisitedNeighbors(row, col);
    
    // 随机打乱邻居顺序
    this.shuffle(neighbors);
    
    for (const neighbor of neighbors) {
      const [nRow, nCol, direction] = neighbor;
      
      if (!this.visited[nRow][nCol]) {
        // 移除当前单元格和邻居之间的墙
        this.removeWall(row, col, nRow, nCol, direction);
        this.dfs(nRow, nCol);
      }
    }
  }

  getUnvisitedNeighbors(row, col) {
    const neighbors = [];
    
    // 上
    if (row > 0) neighbors.push([row - 1, col, 'top']);
    // 右
    if (col < this.cols - 1) neighbors.push([row, col + 1, 'right']);
    // 下
    if (row < this.rows - 1) neighbors.push([row + 1, col, 'bottom']);
    // 左
    if (col > 0) neighbors.push([row, col - 1, 'left']);
    
    return neighbors;
  }

  removeWall(row, col, nRow, nCol, direction) {
    switch (direction) {
      case 'top':
        this.grid[row][col].top = false;
        this.grid[nRow][nCol].bottom = false;
        break;
      case 'right':
        this.grid[row][col].right = false;
        this.grid[nRow][nCol].left = false;
        break;
      case 'bottom':
        this.grid[row][col].bottom = false;
        this.grid[nRow][nCol].top = false;
        break;
      case 'left':
        this.grid[row][col].left = false;
        this.grid[nRow][nCol].right = false;
        break;
    }
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng.frac() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

// 游戏场景
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeRows = 5;
    this.mazeCols = 5;
    this.cellSize = 80;
    this.wallThickness = 4;
    this.playerRow = 0;
    this.playerCol = 0;
    this.targetRow = 4;
    this.targetCol = 4;
    this.steps = 0;
    this.completed = false;
    // 使用时间戳作为默认 seed
    this.seed = Date.now() % 1000000;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 生成迷宫
    const generator = new MazeGenerator(this.seed, this.mazeRows, this.mazeCols);
    this.maze = generator.generate();

    // 计算迷宫起始位置（居中显示）
    this.mazeOffsetX = 150;
    this.mazeOffsetY = 100;

    // 绘制迷宫
    this.drawMaze();

    // 创建玩家
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillCircle(0, 0, this.cellSize * 0.3);
    this.updatePlayerPosition();

    // 创建目标点
    this.target = this.add.graphics();
    this.target.fillStyle(0xff0000, 1);
    this.target.fillCircle(0, 0, this.cellSize * 0.25);
    this.updateTargetPosition();

    // 显示 seed 和状态信息
    this.seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.stepsText = this.add.text(10, 40, `Steps: ${this.steps}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(10, 70, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.lastMoveTime = 0;
    this.moveDelay = 200; // 移动延迟（毫秒）

    // 添加重新生成按钮提示
    this.add.text(10, 520, 'Press SPACE to generate new maze', {
      fontSize: '16px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  drawMaze() {
    if (this.mazeGraphics) {
      this.mazeGraphics.destroy();
    }

    this.mazeGraphics = this.add.graphics();
    this.mazeGraphics.lineStyle(this.wallThickness, 0xffffff, 1);

    for (let r = 0; r < this.mazeRows; r++) {
      for (let c = 0; c < this.mazeCols; c++) {
        const cell = this.maze[r][c];
        const x = this.mazeOffsetX + c * this.cellSize;
        const y = this.mazeOffsetY + r * this.cellSize;

        // 绘制墙壁
        if (cell.top) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(x, y);
          this.mazeGraphics.lineTo(x + this.cellSize, y);
          this.mazeGraphics.strokePath();
        }
        if (cell.right) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(x + this.cellSize, y);
          this.mazeGraphics.lineTo(x + this.cellSize, y + this.cellSize);
          this.mazeGraphics.strokePath();
        }
        if (cell.bottom) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(x, y + this.cellSize);
          this.mazeGraphics.lineTo(x + this.cellSize, y + this.cellSize);
          this.mazeGraphics.strokePath();
        }
        if (cell.left) {
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(x, y);
          this.mazeGraphics.lineTo(x, y + this.cellSize);
          this.mazeGraphics.strokePath();
        }
      }
    }
  }

  updatePlayerPosition() {
    const x = this.mazeOffsetX + this.playerCol * this.cellSize + this.cellSize / 2;
    const y = this.mazeOffsetY + this.playerRow * this.cellSize + this.cellSize / 2;
    this.player.setPosition(x, y);
  }

  updateTargetPosition() {
    const x = this.mazeOffsetX + this.targetCol * this.cellSize + this.cellSize / 2;
    const y = this.mazeOffsetY + this.targetRow * this.cellSize + this.cellSize / 2;
    this.target.setPosition(x, y);
  }

  canMove(direction) {
    const cell = this.maze[this.playerRow][this.playerCol];
    switch (direction) {
      case 'up':
        return !cell.top && this.playerRow > 0;
      case 'down':
        return !cell.bottom && this.playerRow < this.mazeRows - 1;
      case 'left':
        return !cell.left && this.playerCol > 0;
      case 'right':
        return !cell.right && this.playerCol < this.mazeCols - 1;
      default:
        return false;
    }
  }

  movePlayer(direction) {
    if (this.completed) return;

    if (this.canMove(direction)) {
      switch (direction) {
        case 'up':
          this.playerRow--;
          break;
        case 'down':
          this.playerRow++;
          break;
        case 'left':
          this.playerCol--;
          break;
        case 'right':
          this.playerCol++;
          break;
      }
      this.steps++;
      this.updatePlayerPosition();
      this.stepsText.setText(`Steps: ${this.steps}`);

      // 检查是否到达目标
      if (this.playerRow === this.targetRow && this.playerCol === this.targetCol) {
        this.completed = true;
        this.statusText.setText('🎉 Maze Completed!');
        this.statusText.setStyle({ color: '#00ff00' });
      }
    }
  }

  regenerateMaze() {
    // 生成新的 seed
    this.seed = Date.now() % 1000000;
    this.seedText.setText(`Seed: ${this.seed}`);

    // 重置玩家位置和状态
    this.playerRow = 0;
    this.playerCol = 0;
    this.steps = 0;
    this.completed = false;
    this.stepsText.setText(`Steps: ${this.steps}`);
    this.statusText.setText('Use Arrow Keys to Move');
    this.statusText.setStyle({ color: '#ffff00' });

    // 重新生成迷宫
    const generator = new MazeGenerator(this.seed, this.mazeRows, this.mazeCols);
    this.maze = generator.generate();
    this.drawMaze();
    this.updatePlayerPosition();
  }

  update(time, delta) {
    // 处理方向键输入（带延迟防止过快移动）
    if (time - this.lastMoveTime > this.moveDelay) {
      if (this.cursors.up.isDown) {
        this.movePlayer('up');
        this.lastMoveTime = time;
      } else if (this.cursors.down.isDown) {
        this.movePlayer('down');
        this.lastMoveTime = time;
      } else if (this.cursors.left.isDown) {
        this.movePlayer('left');
        this.lastMoveTime = time;
      } else if (this.cursors.right.isDown) {
        this.movePlayer('right');
        this.lastMoveTime = time;
      }
    }

    // 处理空格键重新生成迷宫
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.regenerateMaze();
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: MazeScene
};

// 启动游戏
new Phaser.Game(config);