class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.seed = Date.now(); // 默认使用时间戳作为种子
    this.gridSize = 3; // 3x3 迷宫
    this.cellSize = 150; // 每个单元格大小
    this.wallThickness = 10;
    this.maze = [];
    this.playerX = 0;
    this.playerY = 0;
    this.goalX = 2;
    this.goalY = 2;
    this.hasWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子
    this.seed = this.game.config.seed || Date.now();
    Phaser.Math.RND.seed([this.seed]);

    // 生成迷宫
    this.generateMaze();

    // 绘制迷宫
    this.drawMaze();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(30, 30, 25);
    playerGraphics.generateTexture('player', 60, 60);
    playerGraphics.destroy();

    // 创建目标纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillStar(30, 30, 5, 10, 25);
    goalGraphics.generateTexture('goal', 60, 60);
    goalGraphics.destroy();

    // 添加玩家
    const startPos = this.getCellCenter(this.playerX, this.playerY);
    this.player = this.add.sprite(startPos.x, startPos.y, 'player');

    // 添加目标
    const goalPos = this.getCellCenter(this.goalX, this.goalY);
    this.goal = this.add.sprite(goalPos.x, goalPos.y, 'goal');

    // 显示种子值
    this.seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(10, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 状态文本
    this.statusText = this.add.text(10, 90, 'Position: (0, 0)', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.moveDelay = 200;
    this.lastMoveTime = 0;
  }

  update(time, delta) {
    if (this.hasWon) return;

    // 控制移动频率
    if (time - this.lastMoveTime < this.moveDelay) return;

    let moved = false;
    let newX = this.playerX;
    let newY = this.playerY;

    if (this.cursors.left.isDown) {
      newX--;
      moved = true;
    } else if (this.cursors.right.isDown) {
      newX++;
      moved = true;
    } else if (this.cursors.up.isDown) {
      newY--;
      moved = true;
    } else if (this.cursors.down.isDown) {
      newY++;
      moved = true;
    }

    if (moved && this.canMove(this.playerX, this.playerY, newX, newY)) {
      this.playerX = newX;
      this.playerY = newY;
      this.lastMoveTime = time;

      // 移动玩家精灵
      const newPos = this.getCellCenter(this.playerX, this.playerY);
      this.tweens.add({
        targets: this.player,
        x: newPos.x,
        y: newPos.y,
        duration: 150,
        ease: 'Power2'
      });

      // 更新状态
      this.statusText.setText(`Position: (${this.playerX}, ${this.playerY})`);

      // 检查是否到达目标
      if (this.playerX === this.goalX && this.playerY === this.goalY) {
        this.win();
      }
    }
  }

  generateMaze() {
    // 初始化迷宫网格，每个单元格有四面墙
    this.maze = [];
    for (let y = 0; y < this.gridSize; y++) {
      this.maze[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
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
      if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
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
      this.maze[y1][x1].walls.right = false;
      this.maze[y2][x2].walls.left = false;
    } else if (dx === -1) {
      this.maze[y1][x1].walls.left = false;
      this.maze[y2][x2].walls.right = false;
    } else if (dy === 1) {
      this.maze[y1][x1].walls.bottom = false;
      this.maze[y2][x2].walls.top = false;
    } else if (dy === -1) {
      this.maze[y1][x1].walls.top = false;
      this.maze[y2][x2].walls.bottom = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    graphics.lineStyle(this.wallThickness, 0x0000ff, 1);

    const offsetX = 100;
    const offsetY = 150;

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const cell = this.maze[y][x];
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;

        // 绘制墙壁
        if (cell.walls.top) {
          graphics.lineBetween(px, py, px + this.cellSize, py);
        }
        if (cell.walls.right) {
          graphics.lineBetween(px + this.cellSize, py, px + this.cellSize, py + this.cellSize);
        }
        if (cell.walls.bottom) {
          graphics.lineBetween(px, py + this.cellSize, px + this.cellSize, py + this.cellSize);
        }
        if (cell.walls.left) {
          graphics.lineBetween(px, py, px, py + this.cellSize);
        }
      }
    }

    graphics.strokePath();
  }

  getCellCenter(x, y) {
    const offsetX = 100;
    const offsetY = 150;
    return {
      x: offsetX + x * this.cellSize + this.cellSize / 2,
      y: offsetY + y * this.cellSize + this.cellSize / 2
    };
  }

  canMove(fromX, fromY, toX, toY) {
    // 检查边界
    if (toX < 0 || toX >= this.gridSize || toY < 0 || toY >= this.gridSize) {
      return false;
    }

    // 检查墙壁
    const dx = toX - fromX;
    const dy = toY - fromY;
    const cell = this.maze[fromY][fromX];

    if (dx === 1 && cell.walls.right) return false;
    if (dx === -1 && cell.walls.left) return false;
    if (dy === 1 && cell.walls.bottom) return false;
    if (dy === -1 && cell.walls.top) return false;

    return true;
  }

  win() {
    this.hasWon = true;
    this.statusText.setText('YOU WIN! Refresh to play again.');
    this.statusText.setStyle({ color: '#00ff00', fontSize: '24px' });

    // 添加胜利动画
    this.tweens.add({
      targets: this.player,
      scale: 1.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#222222',
  seed: 12345, // 可以修改这个值来生成不同的迷宫
  scene: MazeScene
};

new Phaser.Game(config);