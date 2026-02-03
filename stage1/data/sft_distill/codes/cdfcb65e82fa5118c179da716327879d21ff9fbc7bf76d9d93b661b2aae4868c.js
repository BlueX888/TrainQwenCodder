class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 8;
    this.cellSize = 60;
    this.wallThickness = 4;
    this.playerPos = { x: 0, y: 0 };
    this.goalPos = { x: 7, y: 7 };
    this.seed = null;
    this.maze = [];
    this.moveSpeed = 200; // ms per move
    this.lastMoveTime = 0;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成随机种子（可以改为固定值以复现）
    this.seed = Date.now() % 1000000;
    
    // 初始化 Phaser 的随机数生成器
    Phaser.Math.RND.sow([this.seed]);
    
    // 生成迷宫
    this.generateMaze();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建终点标记
    this.createGoal();
    
    // 显示 seed
    this.seedText = this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.seedText.setDepth(100);
    
    // 显示提示
    this.hintText = this.add.text(10, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hintText.setDepth(100);
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 胜利文本（初始隐藏）
    this.winText = this.add.text(
      this.mazeSize * this.cellSize / 2,
      this.mazeSize * this.cellSize / 2,
      'YOU WIN!\nPress R to Restart',
      {
        fontSize: '32px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    this.winText.setOrigin(0.5);
    this.winText.setDepth(100);
    this.winText.setVisible(false);
    
    // R 键重新开始
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
  }

  generateMaze() {
    // 初始化迷宫：所有墙都存在
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
    let current = { x: 0, y: 0 };
    this.maze[0][0].visited = true;
    
    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = Phaser.Math.RND.pick(neighbors);
        
        // 移除当前单元格和选中邻居之间的墙
        this.removeWall(current, next);
        
        // 标记邻居为已访问
        this.maze[next.y][next.x].visited = true;
        
        // 将当前单元格压入栈
        stack.push(current);
        
        // 移动到邻居
        current = next;
      } else if (stack.length > 0) {
        // 回溯
        current = stack.pop();
      } else {
        // 完成
        break;
      }
    }
  }

  getUnvisitedNeighbors(x, y) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1, dir: 'top' },    // 上
      { x: 1, y: 0, dir: 'right' },   // 右
      { x: 0, y: 1, dir: 'bottom' },  // 下
      { x: -1, y: 0, dir: 'left' }    // 左
    ];
    
    for (const d of directions) {
      const nx = x + d.x;
      const ny = y + d.y;
      
      if (nx >= 0 && nx < this.mazeSize && ny >= 0 && ny < this.mazeSize) {
        if (!this.maze[ny][nx].visited) {
          neighbors.push({ x: nx, y: ny, dir: d.dir });
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
      this.maze[current.y][current.x].right = false;
      this.maze[next.y][next.x].left = false;
    } else if (dx === -1) {
      // 向左移动
      this.maze[current.y][current.x].left = false;
      this.maze[next.y][next.x].right = false;
    } else if (dy === 1) {
      // 向下移动
      this.maze[current.y][current.x].bottom = false;
      this.maze[next.y][next.x].top = false;
    } else if (dy === -1) {
      // 向上移动
      this.maze[current.y][current.x].top = false;
      this.maze[next.y][next.x].bottom = false;
    }
  }

  drawMaze() {
    this.mazeGraphics = this.add.graphics();
    this.mazeGraphics.lineStyle(this.wallThickness, 0x333333, 1);
    
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = x * this.cellSize;
        const py = y * this.cellSize;
        
        // 绘制墙壁
        if (cell.top) {
          this.mazeGraphics.lineBetween(px, py, px + this.cellSize, py);
        }
        if (cell.right) {
          this.mazeGraphics.lineBetween(
            px + this.cellSize, py,
            px + this.cellSize, py + this.cellSize
          );
        }
        if (cell.bottom) {
          this.mazeGraphics.lineBetween(
            px, py + this.cellSize,
            px + this.cellSize, py + this.cellSize
          );
        }
        if (cell.left) {
          this.mazeGraphics.lineBetween(px, py, px, py + this.cellSize);
        }
      }
    }
    
    this.mazeGraphics.strokePath();
  }

  createPlayer() {
    this.playerGraphics = this.add.graphics();
    this.playerGraphics.fillStyle(0x00ff00, 1);
    this.playerGraphics.fillCircle(0, 0, this.cellSize / 3);
    this.updatePlayerPosition();
  }

  createGoal() {
    this.goalGraphics = this.add.graphics();
    this.goalGraphics.fillStyle(0xff0000, 1);
    this.goalGraphics.fillRect(
      this.goalPos.x * this.cellSize + this.cellSize / 4,
      this.goalPos.y * this.cellSize + this.cellSize / 4,
      this.cellSize / 2,
      this.cellSize / 2
    );
  }

  updatePlayerPosition() {
    const px = this.playerPos.x * this.cellSize + this.cellSize / 2;
    const py = this.playerPos.y * this.cellSize + this.cellSize / 2;
    this.playerGraphics.setPosition(px, py);
  }

  canMove(x, y, direction) {
    if (x < 0 || x >= this.mazeSize || y < 0 || y >= this.mazeSize) {
      return false;
    }
    
    const cell = this.maze[y][x];
    return !cell[direction];
  }

  update(time, delta) {
    if (this.gameWon) {
      return;
    }
    
    // 限制移动速度
    if (time - this.lastMoveTime < this.moveSpeed) {
      return;
    }
    
    let moved = false;
    
    if (this.cursors.up.isDown) {
      if (this.canMove(this.playerPos.x, this.playerPos.y, 'top')) {
        this.playerPos.y--;
        moved = true;
      }
    } else if (this.cursors.down.isDown) {
      if (this.canMove(this.playerPos.x, this.playerPos.y, 'bottom')) {
        this.playerPos.y++;
        moved = true;
      }
    } else if (this.cursors.left.isDown) {
      if (this.canMove(this.playerPos.x, this.playerPos.y, 'left')) {
        this.playerPos.x--;
        moved = true;
      }
    } else if (this.cursors.right.isDown) {
      if (this.canMove(this.playerPos.x, this.playerPos.y, 'right')) {
        this.playerPos.x++;
        moved = true;
      }
    }
    
    if (moved) {
      this.lastMoveTime = time;
      this.updatePlayerPosition();
      this.checkWin();
    }
  }

  checkWin() {
    if (this.playerPos.x === this.goalPos.x && 
        this.playerPos.y === this.goalPos.y) {
      this.gameWon = true;
      this.winText.setVisible(true);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 480,
  backgroundColor: '#ffffff',
  scene: MazeScene
};

new Phaser.Game(config);