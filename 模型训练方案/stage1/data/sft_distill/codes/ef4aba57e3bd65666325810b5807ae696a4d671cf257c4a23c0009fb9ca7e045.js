class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.maze = [];
    this.mazeSize = 8;
    this.cellSize = 60;
    this.playerX = 0;
    this.playerY = 0;
    this.exitX = 7;
    this.exitY = 7;
    this.seed = null;
    this.gameWon = false;
    this.moveCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成随机 seed（可以从 URL 参数或配置获取）
    this.seed = this.getSeedFromUrl() || Math.floor(Math.random() * 1000000);
    
    // 使用 seed 初始化随机数生成器
    Phaser.Math.RND.sow([this.seed.toString()]);
    
    // 生成迷宫
    this.generateMaze();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 绘制玩家
    this.playerGraphics = this.add.graphics();
    this.drawPlayer();
    
    // 绘制出口
    this.exitGraphics = this.add.graphics();
    this.drawExit();
    
    // 显示 seed 和状态信息
    this.seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    this.statusText = this.add.text(10, 40, `Moves: ${this.moveCount}`, {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    this.instructionText = this.add.text(10, 70, 'Arrow keys to move\nReach the green exit!', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown', this.handleKeyDown, this);
  }

  getSeedFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    return seed ? parseInt(seed) : null;
  }

  generateMaze() {
    // 初始化迷宫：所有墙壁都存在
    // maze[y][x] = { top, right, bottom, left, visited }
    this.maze = [];
    for (let y = 0; y < this.mazeSize; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.mazeSize; x++) {
        this.maze[y][x] = {
          top: true,
          right: true,
          bottom: true,
          left: true,
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
        
        // 移除两个单元格之间的墙壁
        this.removeWall(currentX, currentY, next.x, next.y);
        
        // 移动到下一个单元格
        currentX = next.x;
        currentY = next.y;
        this.maze[currentY][currentX].visited = true;
      } else if (stack.length > 0) {
        // 回溯
        const prev = stack.pop();
        currentX = prev.x;
        currentY = prev.y;
      } else {
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
      
      if (nx >= 0 && nx < this.mazeSize && ny >= 0 && ny < this.mazeSize) {
        if (!this.maze[ny][nx].visited) {
          neighbors.push({ x: nx, y: ny });
        }
      }
    }
    
    return neighbors;
  }

  removeWall(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    if (dx === 1) {
      // 向右移动
      this.maze[y1][x1].right = false;
      this.maze[y2][x2].left = false;
    } else if (dx === -1) {
      // 向左移动
      this.maze[y1][x1].left = false;
      this.maze[y2][x2].right = false;
    } else if (dy === 1) {
      // 向下移动
      this.maze[y1][x1].bottom = false;
      this.maze[y2][x2].top = false;
    } else if (dy === -1) {
      // 向上移动
      this.maze[y1][x1].top = false;
      this.maze[y2][x2].bottom = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x00ffff, 1);
    
    const offsetX = 100;
    const offsetY = 100;
    
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;
        
        // 绘制墙壁
        if (cell.top) {
          graphics.lineBetween(px, py, px + this.cellSize, py);
        }
        if (cell.right) {
          graphics.lineBetween(px + this.cellSize, py, px + this.cellSize, py + this.cellSize);
        }
        if (cell.bottom) {
          graphics.lineBetween(px, py + this.cellSize, px + this.cellSize, py + this.cellSize);
        }
        if (cell.left) {
          graphics.lineBetween(px, py, px, py + this.cellSize);
        }
      }
    }
  }

  drawPlayer() {
    this.playerGraphics.clear();
    this.playerGraphics.fillStyle(0xff0000, 1);
    
    const offsetX = 100;
    const offsetY = 100;
    const px = offsetX + this.playerX * this.cellSize + this.cellSize / 2;
    const py = offsetY + this.playerY * this.cellSize + this.cellSize / 2;
    
    this.playerGraphics.fillCircle(px, py, this.cellSize / 3);
  }

  drawExit() {
    this.exitGraphics.clear();
    this.exitGraphics.fillStyle(0x00ff00, 1);
    
    const offsetX = 100;
    const offsetY = 100;
    const px = offsetX + this.exitX * this.cellSize + this.cellSize / 2;
    const py = offsetY + this.exitY * this.cellSize + this.cellSize / 2;
    
    this.exitGraphics.fillRect(
      px - this.cellSize / 3,
      py - this.cellSize / 3,
      this.cellSize * 2 / 3,
      this.cellSize * 2 / 3
    );
  }

  handleKeyDown(event) {
    if (this.gameWon) return;
    
    let newX = this.playerX;
    let newY = this.playerY;
    let canMove = false;
    
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.UP) {
      if (!this.maze[this.playerY][this.playerX].top) {
        newY = this.playerY - 1;
        canMove = true;
      }
    } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.DOWN) {
      if (!this.maze[this.playerY][this.playerX].bottom) {
        newY = this.playerY + 1;
        canMove = true;
      }
    } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.LEFT) {
      if (!this.maze[this.playerY][this.playerX].left) {
        newX = this.playerX - 1;
        canMove = true;
      }
    } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.RIGHT) {
      if (!this.maze[this.playerY][this.playerX].right) {
        newX = this.playerX + 1;
        canMove = true;
      }
    }
    
    if (canMove) {
      this.playerX = newX;
      this.playerY = newY;
      this.moveCount++;
      this.drawPlayer();
      this.statusText.setText(`Moves: ${this.moveCount}`);
      
      // 检查是否到达出口
      if (this.playerX === this.exitX && this.playerY === this.exitY) {
        this.gameWon = true;
        this.showWinMessage();
      }
    }
  }

  showWinMessage() {
    const winText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      `YOU WIN!\nMoves: ${this.moveCount}\nSeed: ${this.seed}`,
      {
        fontSize: '32px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 20 },
        align: 'center'
      }
    );
    winText.setOrigin(0.5);
  }

  update(time, delta) {
    // 游戏逻辑在事件处理中完成
  }
}

const config = {
  type: Phaser.AUTO,
  width: 700,
  height: 700,
  backgroundColor: '#222222',
  scene: MazeScene
};

new Phaser.Game(config);