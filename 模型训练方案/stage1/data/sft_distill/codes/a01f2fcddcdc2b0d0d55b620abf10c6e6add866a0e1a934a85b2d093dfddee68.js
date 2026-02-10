class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.currentSeed = null;
    this.maze = null;
    this.cellSize = 150;
    this.wallThickness = 10;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成随机种子（可以手动设置特定种子）
    this.currentSeed = Date.now() % 1000000;
    
    // 设置随机种子
    Phaser.Math.RND.sow([this.currentSeed]);
    
    // 显示种子信息
    this.seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 生成迷宫
    this.generateMaze();
    
    // 绘制迷宫
    this.drawMaze();
    
    // 添加重新生成按钮
    const regenerateBtn = this.add.text(10, 50, 'Regenerate (R)', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setInteractive();
    
    regenerateBtn.on('pointerdown', () => {
      this.regenerateMaze();
    });
    
    // 添加使用相同种子重新生成的按钮
    const replayBtn = this.add.text(10, 90, 'Replay Same Seed (S)', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setInteractive();
    
    replayBtn.on('pointerdown', () => {
      this.replaySameSeed();
    });
    
    // 键盘控制
    this.input.keyboard.on('keydown-R', () => {
      this.regenerateMaze();
    });
    
    this.input.keyboard.on('keydown-S', () => {
      this.replaySameSeed();
    });
    
    // 状态信号
    this.mazeGenerated = true;
    this.generationCount = 1;
    
    // 显示生成次数
    this.statusText = this.add.text(10, 130, `Generation Count: ${this.generationCount}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  generateMaze() {
    const size = 3;
    
    // 初始化迷宫网格，每个单元格包含四面墙的状态
    this.maze = [];
    for (let y = 0; y < size; y++) {
      this.maze[y] = [];
      for (let x = 0; x < size; x++) {
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
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y, size);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const randomIndex = Phaser.Math.RND.between(0, neighbors.length - 1);
        const next = neighbors[randomIndex];
        
        // 移除两个单元格之间的墙
        this.removeWall(current, next);
        
        // 标记为已访问并加入栈
        this.maze[next.y][next.x].visited = true;
        stack.push(next);
      } else {
        // 回溯
        stack.pop();
      }
    }
  }

  getUnvisitedNeighbors(x, y, size) {
    const neighbors = [];
    const directions = [
      { dx: 0, dy: -1, dir: 'top' },    // 上
      { dx: 1, dy: 0, dir: 'right' },   // 右
      { dx: 0, dy: 1, dir: 'bottom' },  // 下
      { dx: -1, dy: 0, dir: 'left' }    // 左
    ];
    
    for (const d of directions) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && !this.maze[ny][nx].visited) {
        neighbors.push({ x: nx, y: ny, direction: d.dir });
      }
    }
    
    return neighbors;
  }

  removeWall(current, next) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    
    if (dx === 1) {
      // 向右移动
      this.maze[current.y][current.x].walls.right = false;
      this.maze[next.y][next.x].walls.left = false;
    } else if (dx === -1) {
      // 向左移动
      this.maze[current.y][current.x].walls.left = false;
      this.maze[next.y][next.x].walls.right = false;
    } else if (dy === 1) {
      // 向下移动
      this.maze[current.y][current.x].walls.bottom = false;
      this.maze[next.y][next.x].walls.top = false;
    } else if (dy === -1) {
      // 向上移动
      this.maze[current.y][current.x].walls.top = false;
      this.maze[next.y][next.x].walls.bottom = false;
    }
  }

  drawMaze() {
    // 清除之前的图形
    if (this.mazeGraphics) {
      this.mazeGraphics.destroy();
    }
    
    this.mazeGraphics = this.add.graphics();
    
    const offsetX = 200;
    const offsetY = 200;
    const size = 3;
    
    // 绘制背景
    this.mazeGraphics.fillStyle(0x1a1a1a, 1);
    this.mazeGraphics.fillRect(
      offsetX - this.wallThickness,
      offsetY - this.wallThickness,
      size * this.cellSize + this.wallThickness * 2,
      size * this.cellSize + this.wallThickness * 2
    );
    
    // 绘制通路（白色）
    this.mazeGraphics.fillStyle(0xffffff, 1);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        
        this.mazeGraphics.fillRect(cellX, cellY, this.cellSize, this.cellSize);
      }
    }
    
    // 绘制墙壁（黑色）
    this.mazeGraphics.fillStyle(0x000000, 1);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const cellX = offsetX + x * this.cellSize;
        const cellY = offsetY + y * this.cellSize;
        const walls = this.maze[y][x].walls;
        
        // 绘制上墙
        if (walls.top) {
          this.mazeGraphics.fillRect(
            cellX,
            cellY - this.wallThickness / 2,
            this.cellSize,
            this.wallThickness
          );
        }
        
        // 绘制右墙
        if (walls.right) {
          this.mazeGraphics.fillRect(
            cellX + this.cellSize - this.wallThickness / 2,
            cellY,
            this.wallThickness,
            this.cellSize
          );
        }
        
        // 绘制下墙
        if (walls.bottom) {
          this.mazeGraphics.fillRect(
            cellX,
            cellY + this.cellSize - this.wallThickness / 2,
            this.cellSize,
            this.wallThickness
          );
        }
        
        // 绘制左墙
        if (walls.left) {
          this.mazeGraphics.fillRect(
            cellX - this.wallThickness / 2,
            cellY,
            this.wallThickness,
            this.cellSize
          );
        }
      }
    }
    
    // 标记起点和终点
    this.mazeGraphics.fillStyle(0x00ff00, 1);
    this.mazeGraphics.fillCircle(offsetX + this.cellSize / 2, offsetY + this.cellSize / 2, 20);
    
    this.mazeGraphics.fillStyle(0xff0000, 1);
    this.mazeGraphics.fillCircle(
      offsetX + (size - 1) * this.cellSize + this.cellSize / 2,
      offsetY + (size - 1) * this.cellSize + this.cellSize / 2,
      20
    );
  }

  regenerateMaze() {
    // 生成新的随机种子
    this.currentSeed = Date.now() % 1000000;
    Phaser.Math.RND.sow([this.currentSeed]);
    
    this.seedText.setText(`Seed: ${this.currentSeed}`);
    
    this.generateMaze();
    this.drawMaze();
    
    this.generationCount++;
    this.statusText.setText(`Generation Count: ${this.generationCount}`);
  }

  replaySameSeed() {
    // 使用相同的种子重新生成
    Phaser.Math.RND.sow([this.currentSeed]);
    
    this.generateMaze();
    this.drawMaze();
    
    this.generationCount++;
    this.statusText.setText(`Generation Count: ${this.generationCount} (Replay)`);
  }

  update(time, delta) {
    // 更新逻辑（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: MazeScene
};

new Phaser.Game(config);