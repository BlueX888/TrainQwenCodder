class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 12;
    this.cellSize = 40;
    this.wallThickness = 4;
    this.seed = null;
    this.maze = [];
    this.playerX = 0;
    this.playerY = 0;
    this.goalX = this.mazeSize - 1;
    this.goalY = this.mazeSize - 1;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成随机种子（或使用固定种子）
    this.seed = Date.now() % 1000000; // 使用时间戳生成种子
    // this.seed = 123456; // 可以使用固定种子进行测试
    
    // 设置 Phaser 的随机数生成器种子
    Phaser.Math.RND.sow([this.seed]);
    
    // 显示种子信息
    this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);
    
    // 生成迷宫
    this.generateMaze();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建目标点
    this.createGoal();
    
    // 添加控制说明
    this.add.text(10, 40, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);
    
    // 添加状态信息
    this.statusText = this.add.text(10, 70, 'Status: Playing', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 游戏状态
    this.gameWon = false;
    this.moveCount = 0;
  }

  generateMaze() {
    // 初始化迷宫网格
    // 每个单元格有四个墙：[上, 右, 下, 左]
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
    
    // 使用深度优先搜索生成迷宫
    const stack = [];
    let currentX = 0;
    let currentY = 0;
    this.maze[currentY][currentX].visited = true;
    
    while (true) {
      const neighbors = this.getUnvisitedNeighbors(currentX, currentY);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = Phaser.Math.RND.pick(neighbors);
        stack.push({ x: currentX, y: currentY });
        
        // 移除当前单元格和邻居之间的墙
        this.removeWall(currentX, currentY, next.x, next.y);
        
        // 移动到邻居
        currentX = next.x;
        currentY = next.y;
        this.maze[currentY][currentX].visited = true;
      } else if (stack.length > 0) {
        // 回溯
        const prev = stack.pop();
        currentX = prev.x;
        currentY = prev.y;
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
          !this.maze[ny][nx].visited) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    
    return neighbors;
  }

  removeWall(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    if (dy === -1) { // 向上
      this.maze[y1][x1].walls[0] = false; // 移除上墙
      this.maze[y2][x2].walls[2] = false; // 移除下墙
    } else if (dx === 1) { // 向右
      this.maze[y1][x1].walls[1] = false; // 移除右墙
      this.maze[y2][x2].walls[3] = false; // 移除左墙
    } else if (dy === 1) { // 向下
      this.maze[y1][x1].walls[2] = false; // 移除下墙
      this.maze[y2][x2].walls[0] = false; // 移除上墙
    } else if (dx === -1) { // 向左
      this.maze[y1][x1].walls[3] = false; // 移除左墙
      this.maze[y2][x2].walls[1] = false; // 移除右墙
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 100;
    const offsetY = 100;
    
    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      offsetX, 
      offsetY, 
      this.mazeSize * this.cellSize, 
      this.mazeSize * this.cellSize
    );
    
    // 绘制路径
    graphics.fillStyle(0xeeeeee, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const px = offsetX + x * this.cellSize + this.wallThickness;
        const py = offsetY + y * this.cellSize + this.wallThickness;
        const size = this.cellSize - this.wallThickness * 2;
        graphics.fillRect(px, py, size, size);
      }
    }
    
    // 绘制墙壁
    graphics.lineStyle(this.wallThickness, 0x333333, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        
        // 上墙
        if (cell.walls[0]) {
          graphics.beginPath();
          graphics.moveTo(px, py);
          graphics.lineTo(px + this.cellSize, py);
          graphics.strokePath();
        }
        
        // 右墙
        if (cell.walls[1]) {
          graphics.beginPath();
          graphics.moveTo(px + this.cellSize, py);
          graphics.lineTo(px + this.cellSize, py + this.cellSize);
          graphics.strokePath();
        }
        
        // 下墙
        if (cell.walls[2]) {
          graphics.beginPath();
          graphics.moveTo(px, py + this.cellSize);
          graphics.lineTo(px + this.cellSize, py + this.cellSize);
          graphics.strokePath();
        }
        
        // 左墙
        if (cell.walls[3]) {
          graphics.beginPath();
          graphics.moveTo(px, py);
          graphics.lineTo(px, py + this.cellSize);
          graphics.strokePath();
        }
      }
    }
    
    this.mazeOffsetX = offsetX;
    this.mazeOffsetY = offsetY;
  }

  createPlayer() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, this.cellSize / 3);
    graphics.generateTexture('player', this.cellSize, this.cellSize);
    graphics.destroy();
    
    this.player = this.add.sprite(
      this.mazeOffsetX + this.playerX * this.cellSize + this.cellSize / 2,
      this.mazeOffsetY + this.playerY * this.cellSize + this.cellSize / 2,
      'player'
    ).setDepth(10);
  }

  createGoal() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(
      -this.cellSize / 3, 
      -this.cellSize / 3, 
      this.cellSize * 2 / 3, 
      this.cellSize * 2 / 3
    );
    graphics.generateTexture('goal', this.cellSize, this.cellSize);
    graphics.destroy();
    
    this.goal = this.add.sprite(
      this.mazeOffsetX + this.goalX * this.cellSize + this.cellSize / 2,
      this.mazeOffsetY + this.goalY * this.cellSize + this.cellSize / 2,
      'goal'
    ).setDepth(10);
  }

  update() {
    if (this.gameWon) return;
    
    // 处理玩家移动
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.tryMove(0, -1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.tryMove(1, 0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.tryMove(0, 1, 2);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.tryMove(-1, 0, 3);
    }
  }

  tryMove(dx, dy, wallIndex) {
    const newX = this.playerX + dx;
    const newY = this.playerY + dy;
    
    // 检查边界
    if (newX < 0 || newX >= this.mazeSize || 
        newY < 0 || newY >= this.mazeSize) {
      return;
    }
    
    // 检查墙壁
    if (this.maze[this.playerY][this.playerX].walls[wallIndex]) {
      return;
    }
    
    // 移动玩家
    this.playerX = newX;
    this.playerY = newY;
    this.moveCount++;
    
    this.player.setPosition(
      this.mazeOffsetX + this.playerX * this.cellSize + this.cellSize / 2,
      this.mazeOffsetY + this.playerY * this.cellSize + this.cellSize / 2
    );
    
    // 检查是否到达目标
    if (this.playerX === this.goalX && this.playerY === this.goalY) {
      this.gameWon = true;
      this.statusText.setText(`Status: Won! (Moves: ${this.moveCount})`);
      this.statusText.setStyle({ color: '#00ff00' });
    } else {
      this.statusText.setText(`Status: Playing (Moves: ${this.moveCount})`);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 700,
  backgroundColor: '#000000',
  scene: MazeScene
};

new Phaser.Game(config);