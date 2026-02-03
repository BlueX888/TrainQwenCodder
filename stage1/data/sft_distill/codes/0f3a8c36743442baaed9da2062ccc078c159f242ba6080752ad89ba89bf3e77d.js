class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 15;
    this.cellSize = 40;
    this.seed = null;
    this.maze = [];
    this.playerX = 0;
    this.playerY = 0;
    this.goalReached = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成或使用固定的 seed
    this.seed = this.getSeedFromURL() || Date.now();
    
    // 设置 Phaser 的随机数生成器种子
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed.toString()]);
    
    // 生成迷宫
    this.generateMaze();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建目标点
    this.createGoal();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加状态文本
    this.statusText = this.add.text(10, this.mazeSize * this.cellSize + 60, 
      'Status: Playing | Moves: 0', 
      { fontSize: '18px', fill: '#fff' }
    );
    
    this.moves = 0;
  }

  getSeedFromURL() {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    return seed ? parseInt(seed) : null;
  }

  generateMaze() {
    // 初始化迷宫网格（所有墙壁）
    this.maze = [];
    for (let y = 0; y < this.mazeSize; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.mazeSize; x++) {
        this.maze[y][x] = {
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true }
        };
      }
    }

    // 使用深度优先搜索生成迷宫
    const stack = [];
    let currentX = 0;
    let currentY = 0;
    this.maze[currentY][currentX].visited = true;
    stack.push({ x: currentX, y: currentY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);

      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = neighbors[Math.floor(this.rnd.frac() * neighbors.length)];
        
        // 移除两个单元格之间的墙
        this.removeWall(current, next);
        
        // 标记为已访问并压入栈
        this.maze[next.y][next.x].visited = true;
        stack.push(next);
      } else {
        // 回溯
        stack.pop();
      }
    }
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
      const newX = x + dir.x;
      const newY = y + dir.y;
      
      if (newX >= 0 && newX < this.mazeSize && 
          newY >= 0 && newY < this.mazeSize && 
          !this.maze[newY][newX].visited) {
        neighbors.push({ x: newX, y: newY, direction: dir.name });
      }
    }

    return neighbors;
  }

  removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (dx === 1) {
      this.maze[current.y][current.x].walls.right = false;
      this.maze[next.y][next.x].walls.left = false;
    } else if (dx === -1) {
      this.maze[current.y][current.x].walls.left = false;
      this.maze[next.y][next.x].walls.right = false;
    } else if (dy === 1) {
      this.maze[current.y][current.x].walls.bottom = false;
      this.maze[next.y][next.x].walls.top = false;
    } else if (dy === -1) {
      this.maze[current.y][current.x].walls.top = false;
      this.maze[next.y][next.x].walls.bottom = false;
    }
  }

  drawMaze() {
    this.mazeGraphics = this.add.graphics();
    this.mazeGraphics.lineStyle(2, 0x00ff00, 1);

    const offsetX = 50;
    const offsetY = 50;

    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;

        // 绘制墙壁
        if (cell.walls.top) {
          this.mazeGraphics.lineBetween(px, py, px + this.cellSize, py);
        }
        if (cell.walls.right) {
          this.mazeGraphics.lineBetween(px + this.cellSize, py, 
                                        px + this.cellSize, py + this.cellSize);
        }
        if (cell.walls.bottom) {
          this.mazeGraphics.lineBetween(px, py + this.cellSize, 
                                        px + this.cellSize, py + this.cellSize);
        }
        if (cell.walls.left) {
          this.mazeGraphics.lineBetween(px, py, px, py + this.cellSize);
        }
      }
    }
  }

  createPlayer() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    const offsetX = 50;
    const offsetY = 50;
    
    this.player = this.add.sprite(
      offsetX + this.cellSize / 2,
      offsetY + this.cellSize / 2,
      'player'
    );
  }

  createGoal() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(4, 4, 24, 24);
    graphics.generateTexture('goal', 32, 32);
    graphics.destroy();

    const offsetX = 50;
    const offsetY = 50;
    
    this.goal = this.add.sprite(
      offsetX + (this.mazeSize - 1) * this.cellSize + this.cellSize / 2,
      offsetY + (this.mazeSize - 1) * this.cellSize + this.cellSize / 2,
      'goal'
    );
  }

  displaySeedInfo() {
    const seedText = this.add.text(10, 10, 
      `Seed: ${this.seed}`, 
      { fontSize: '20px', fill: '#00ff00', backgroundColor: '#000' }
    );
    
    const urlText = this.add.text(10, 35, 
      `URL: ?seed=${this.seed}`, 
      { fontSize: '14px', fill: '#ffff00' }
    );
  }

  update() {
    if (this.goalReached) return;

    let moved = false;
    let newX = this.playerX;
    let newY = this.playerY;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      if (!this.maze[this.playerY][this.playerX].walls.top) {
        newY--;
        moved = true;
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      if (!this.maze[this.playerY][this.playerX].walls.bottom) {
        newY++;
        moved = true;
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      if (!this.maze[this.playerY][this.playerX].walls.left) {
        newX--;
        moved = true;
      }
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      if (!this.maze[this.playerY][this.playerX].walls.right) {
        newX++;
        moved = true;
      }
    }

    if (moved) {
      this.playerX = newX;
      this.playerY = newY;
      this.moves++;

      const offsetX = 50;
      const offsetY = 50;
      this.player.x = offsetX + this.playerX * this.cellSize + this.cellSize / 2;
      this.player.y = offsetY + this.playerY * this.cellSize + this.cellSize / 2;

      // 检查是否到达目标
      if (this.playerX === this.mazeSize - 1 && this.playerY === this.mazeSize - 1) {
        this.goalReached = true;
        this.statusText.setText(`Status: WIN! | Moves: ${this.moves}`);
        this.statusText.setColor('#00ff00');
      } else {
        this.statusText.setText(`Status: Playing | Moves: ${this.moves}`);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 750,
  backgroundColor: '#000000',
  scene: MazeScene
};

new Phaser.Game(config);