class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 12;
    this.cellSize = 40;
    this.maze = [];
    this.seed = Date.now() % 1000000; // 使用时间戳生成 seed
    this.pathCount = 0; // 可验证状态：路径单元格数量
  }

  preload() {
    // 无需预加载资源
  }

  create() {
    // 设置随机种子
    this.game.config.seed = [this.seed.toString()];
    Phaser.Math.RND.sow([this.seed.toString()]);

    // 显示 seed 信息
    this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示迷宫信息
    this.infoText = this.add.text(10, 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 生成迷宫
    this.generateMaze();

    // 绘制迷宫
    this.drawMaze();

    // 更新信息显示
    this.infoText.setText(
      `Size: ${this.mazeSize}x${this.mazeSize}\n` +
      `Paths: ${this.pathCount}\n` +
      `Press R to regenerate`
    );

    // 添加重新生成按钮
    this.input.keyboard.on('keydown-R', () => {
      this.seed = Date.now() % 1000000;
      this.scene.restart();
    });
  }

  generateMaze() {
    // 初始化迷宫：所有墙壁都存在
    // 每个单元格存储四个方向的墙壁状态：{ top, right, bottom, left }
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
    this.pathCount = 1;

    while (true) {
      // 获取未访问的邻居
      const neighbors = this.getUnvisitedNeighbors(currentX, currentY);

      if (neighbors.length > 0) {
        // 随机选择一个邻居
        const next = Phaser.Math.RND.pick(neighbors);
        
        // 压栈当前位置
        stack.push({ x: currentX, y: currentY });

        // 移除当前单元格和邻居之间的墙壁
        this.removeWall(currentX, currentY, next.x, next.y);

        // 移动到邻居
        currentX = next.x;
        currentY = next.y;
        this.maze[currentY][currentX].visited = true;
        this.pathCount++;
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

    if (dx === 1) {
      // 向右移动
      this.maze[y1][x1].walls.right = false;
      this.maze[y2][x2].walls.left = false;
    } else if (dx === -1) {
      // 向左移动
      this.maze[y1][x1].walls.left = false;
      this.maze[y2][x2].walls.right = false;
    } else if (dy === 1) {
      // 向下移动
      this.maze[y1][x1].walls.bottom = false;
      this.maze[y2][x2].walls.top = false;
    } else if (dy === -1) {
      // 向上移动
      this.maze[y1][x1].walls.top = false;
      this.maze[y2][x2].walls.bottom = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    const offsetX = 100;
    const offsetY = 120;

    // 绘制背景
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillRect(
      offsetX,
      offsetY,
      this.mazeSize * this.cellSize,
      this.mazeSize * this.cellSize
    );

    // 绘制路径
    graphics.fillStyle(0x333333, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        graphics.fillRect(
          offsetX + x * this.cellSize + 2,
          offsetY + y * this.cellSize + 2,
          this.cellSize - 4,
          this.cellSize - 4
        );
      }
    }

    // 绘制墙壁
    graphics.lineStyle(3, 0xffffff, 1);
    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = offsetX + x * this.cellSize;
        const py = offsetY + y * this.cellSize;

        if (cell.walls.top) {
          graphics.beginPath();
          graphics.moveTo(px, py);
          graphics.lineTo(px + this.cellSize, py);
          graphics.strokePath();
        }
        if (cell.walls.right) {
          graphics.beginPath();
          graphics.moveTo(px + this.cellSize, py);
          graphics.lineTo(px + this.cellSize, py + this.cellSize);
          graphics.strokePath();
        }
        if (cell.walls.bottom) {
          graphics.beginPath();
          graphics.moveTo(px, py + this.cellSize);
          graphics.lineTo(px + this.cellSize, py + this.cellSize);
          graphics.strokePath();
        }
        if (cell.walls.left) {
          graphics.beginPath();
          graphics.moveTo(px, py);
          graphics.lineTo(px, py + this.cellSize);
          graphics.strokePath();
        }
      }
    }

    // 标记起点（左上角，绿色）
    graphics.fillStyle(0x00ff00, 0.6);
    graphics.fillRect(
      offsetX + 5,
      offsetY + 5,
      this.cellSize - 10,
      this.cellSize - 10
    );

    // 标记终点（右下角，红色）
    graphics.fillStyle(0xff0000, 0.6);
    graphics.fillRect(
      offsetX + (this.mazeSize - 1) * this.cellSize + 5,
      offsetY + (this.mazeSize - 1) * this.cellSize + 5,
      this.cellSize - 10,
      this.cellSize - 10
    );

    // 添加标签
    this.add.text(offsetX, offsetY - 25, 'Start', {
      fontSize: '14px',
      color: '#00ff00'
    });
    this.add.text(
      offsetX + (this.mazeSize - 1) * this.cellSize,
      offsetY + this.mazeSize * this.cellSize + 5,
      'End',
      { fontSize: '14px', color: '#ff0000' }
    );
  }

  update(time, delta) {
    // 无需每帧更新
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#000000',
  scene: MazeScene
};

new Phaser.Game(config);