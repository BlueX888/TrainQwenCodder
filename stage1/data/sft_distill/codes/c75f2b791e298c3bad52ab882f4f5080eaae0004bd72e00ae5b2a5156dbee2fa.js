// 迷宫生成器类
class MazeGenerator {
  constructor(width, height, rng) {
    this.width = width;
    this.height = height;
    this.rng = rng;
    this.grid = [];
    this.visited = [];
    
    // 初始化网格 (每个单元格有四面墙: top, right, bottom, left)
    for (let y = 0; y < height; y++) {
      this.grid[y] = [];
      this.visited[y] = [];
      for (let x = 0; x < width; x++) {
        this.grid[y][x] = {
          walls: [true, true, true, true] // [top, right, bottom, left]
        };
        this.visited[y][x] = false;
      }
    }
  }
  
  generate() {
    // 使用深度优先搜索生成迷宫
    const stack = [];
    let current = { x: 0, y: 0 };
    this.visited[0][0] = true;
    
    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = neighbors[Math.floor(this.rng.frac() * neighbors.length)];
        stack.push(current);
        
        // 移除当前单元格和选中邻居之间的墙
        this.removeWall(current, next);
        
        current = next;
        this.visited[current.y][current.x] = true;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }
    
    return this.grid;
  }
  
  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    
    // 上
    if (y > 0 && !this.visited[y - 1][x]) {
      neighbors.push({ x, y: y - 1, dir: 0 });
    }
    // 右
    if (x < this.width - 1 && !this.visited[y][x + 1]) {
      neighbors.push({ x: x + 1, y, dir: 1 });
    }
    // 下
    if (y < this.height - 1 && !this.visited[y + 1][x]) {
      neighbors.push({ x, y: y + 1, dir: 2 });
    }
    // 左
    if (x > 0 && !this.visited[y][x - 1]) {
      neighbors.push({ x: x - 1, y, dir: 3 });
    }
    
    return neighbors;
  }
  
  removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    if (dx === 1) { // 向右
      this.grid[current.y][current.x].walls[1] = false;
      this.grid[next.y][next.x].walls[3] = false;
    } else if (dx === -1) { // 向左
      this.grid[current.y][current.x].walls[3] = false;
      this.grid[next.y][next.x].walls[1] = false;
    } else if (dy === 1) { // 向下
      this.grid[current.y][current.x].walls[2] = false;
      this.grid[next.y][next.x].walls[0] = false;
    } else if (dy === -1) { // 向上
      this.grid[current.y][current.x].walls[0] = false;
      this.grid[next.y][next.x].walls[2] = false;
    }
  }
}

// 游戏场景
class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeWidth = 5;
    this.mazeHeight = 5;
    this.cellSize = 80;
    this.wallThickness = 4;
    this.playerX = 0;
    this.playerY = 0;
    this.goalX = 4;
    this.goalY = 4;
    this.hasWon = false;
    this.seed = null;
  }
  
  preload() {
    // 不需要加载外部资源
  }
  
  create() {
    // 生成或使用固定的 seed
    this.seed = this.game.config.seed || Date.now();
    console.log('Maze Seed:', this.seed);
    
    // 设置随机数生成器
    this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);
    
    // 生成迷宫
    const generator = new MazeGenerator(this.mazeWidth, this.mazeHeight, this.rng);
    this.maze = generator.generate();
    
    // 创建图形对象
    this.graphics = this.add.graphics();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 绘制目标点
    this.goalGraphics = this.add.graphics();
    this.drawGoal();
    
    // 绘制玩家
    this.playerGraphics = this.add.graphics();
    this.drawPlayer();
    
    // 显示 seed 和状态信息
    this.seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    this.statusText = this.add.text(10, 40, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    this.winText = this.add.text(400, 300, '', {
      fontSize: '32px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    
    // 防止重复触发
    this.moveDelay = 150;
    this.lastMoveTime = 0;
  }
  
  update(time, delta) {
    if (this.hasWon) {
      // 按 R 重新生成迷宫
      if (Phaser.Input.Keyboard.JustDown(this.keyR)) {
        this.scene.restart();
      }
      return;
    }
    
    // 移动控制（带延迟避免过快移动）
    if (time - this.lastMoveTime > this.moveDelay) {
      let moved = false;
      
      if (this.cursors.up.isDown || this.keyW.isDown) {
        moved = this.tryMove(0, -1, 0); // 上
      } else if (this.cursors.right.isDown || this.keyD.isDown) {
        moved = this.tryMove(1, 0, 1); // 右
      } else if (this.cursors.down.isDown || this.keyS.isDown) {
        moved = this.tryMove(0, 1, 2); // 下
      } else if (this.cursors.left.isDown || this.keyA.isDown) {
        moved = this.tryMove(-1, 0, 3); // 左
      }
      
      if (moved) {
        this.lastMoveTime = time;
        this.drawPlayer();
        this.checkWin();
      }
    }
  }
  
  tryMove(dx, dy, wallIndex) {
    const newX = this.playerX + dx;
    const newY = this.playerY + dy;
    
    // 检查边界
    if (newX < 0 || newX >= this.mazeWidth || newY < 0 || newY >= this.mazeHeight) {
      return false;
    }
    
    // 检查墙壁
    if (this.maze[this.playerY][this.playerX].walls[wallIndex]) {
      return false;
    }
    
    // 移动玩家
    this.playerX = newX;
    this.playerY = newY;
    return true;
  }
  
  drawMaze() {
    this.graphics.clear();
    this.graphics.lineStyle(this.wallThickness, 0x333333, 1);
    
    const offsetX = 50;
    const offsetY = 80;
    
    for (let y = 0; y < this.mazeHeight; y++) {
      for (let x = 0; x < this.mazeWidth; x++) {
        const cell = this.maze[y][x];
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        
        // 绘制墙壁
        if (cell.walls[0]) { // 上墙
          this.graphics.lineBetween(px, py, px + this.cellSize, py);
        }
        if (cell.walls[1]) { // 右墙
          this.graphics.lineBetween(px + this.cellSize, py, px + this.cellSize, py + this.cellSize);
        }
        if (cell.walls[2]) { // 下墙
          this.graphics.lineBetween(px, py + this.cellSize, px + this.cellSize, py + this.cellSize);
        }
        if (cell.walls[3]) { // 左墙
          this.graphics.lineBetween(px, py, px, py + this.cellSize);
        }
      }
    }
  }
  
  drawPlayer() {
    this.playerGraphics.clear();
    this.playerGraphics.fillStyle(0x00aaff, 1);
    
    const offsetX = 50;
    const offsetY = 80;
    const px = offsetX + this.playerX * this.cellSize + this.cellSize / 2;
    const py = offsetY + this.playerY * this.cellSize + this.cellSize / 2;
    
    this.playerGraphics.fillCircle(px, py, this.cellSize / 3);
  }
  
  drawGoal() {
    this.goalGraphics.clear();
    this.goalGraphics.fillStyle(0x00ff00, 1);
    
    const offsetX = 50;
    const offsetY = 80;
    const px = offsetX + this.goalX * this.cellSize + this.cellSize / 2;
    const py = offsetY + this.goalY * this.cellSize + this.cellSize / 2;
    
    this.goalGraphics.fillCircle(px, py, this.cellSize / 4);
  }
  
  checkWin() {
    if (this.playerX === this.goalX && this.playerY === this.goalY) {
      this.hasWon = true;
      this.winText.setText('YOU WIN!\nPress R to Restart');
      this.winText.setVisible(true);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: MazeScene,
  // 可以在这里设置固定 seed 用于测试
  // seed: ['12345']  // 取消注释以使用固定 seed
};

const game = new Phaser.Game(config);