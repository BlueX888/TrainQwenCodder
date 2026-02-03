class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.mazeSize = 15;
    this.cellSize = 40;
    this.wallThickness = 4;
    this.seed = Date.now() % 1000000; // 可配置的种子
    this.level = 1;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子
    this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);
    
    // 显示 seed 信息
    this.add.text(10, 10, `Seed: ${this.seed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    // 显示状态信息
    this.statusText = this.add.text(10, 45, `Level: ${this.level} | Score: ${this.score}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);

    // 生成迷宫
    this.maze = this.generateMaze(this.mazeSize, this.mazeSize);
    
    // 绘制迷宫
    this.drawMaze();
    
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 14);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建终点纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(4, 4, 24, 24);
    goalGraphics.generateTexture('goal', 32, 32);
    goalGraphics.destroy();

    // 添加物理系统
    this.physics.world.setBounds(
      0, 
      0, 
      this.mazeSize * this.cellSize, 
      this.mazeSize * this.cellSize
    );

    // 创建玩家
    const startX = this.cellSize / 2;
    const startY = this.cellSize / 2;
    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setScale(0.8);

    // 创建终点
    const goalX = (this.mazeSize - 0.5) * this.cellSize;
    const goalY = (this.mazeSize - 0.5) * this.cellSize;
    this.goal = this.physics.add.sprite(goalX, goalY, 'goal');
    this.goal.setScale(0.8);

    // 创建墙壁碰撞组
    this.walls = this.physics.add.staticGroup();
    this.createWallColliders();

    // 设置碰撞
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    // 添加重置键
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    // 添加新种子键
    this.input.keyboard.on('keydown-N', () => {
      this.seed = Date.now() % 1000000;
      this.scene.restart();
    });

    // 提示文本
    this.add.text(10, this.mazeSize * this.cellSize + 10, 
      'Arrow Keys/WASD: Move | R: Restart | N: New Maze', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 摄像机跟随玩家
    this.cameras.main.setBounds(0, 0, this.mazeSize * this.cellSize, this.mazeSize * this.cellSize);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  generateMaze(width, height) {
    // 初始化迷宫，所有墙壁都存在
    const maze = [];
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true }
        };
      }
    }

    // 深度优先搜索生成迷宫
    const stack = [];
    let current = { x: 0, y: 0 };
    maze[0][0].visited = true;

    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current, maze, width, height);
      
      if (neighbors.length > 0) {
        // 随机选择一个邻居
        const next = neighbors[this.rnd.between(0, neighbors.length - 1)];
        
        // 移除当前单元格和邻居之间的墙
        this.removeWall(current, next, maze);
        
        stack.push(current);
        maze[next.y][next.x].visited = true;
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop();
      } else {
        break;
      }
    }

    return maze;
  }

  getUnvisitedNeighbors(cell, maze, width, height) {
    const neighbors = [];
    const { x, y } = cell;

    // 上
    if (y > 0 && !maze[y - 1][x].visited) {
      neighbors.push({ x, y: y - 1, dir: 'top' });
    }
    // 右
    if (x < width - 1 && !maze[y][x + 1].visited) {
      neighbors.push({ x: x + 1, y, dir: 'right' });
    }
    // 下
    if (y < height - 1 && !maze[y + 1][x].visited) {
      neighbors.push({ x, y: y + 1, dir: 'bottom' });
    }
    // 左
    if (x > 0 && !maze[y][x - 1].visited) {
      neighbors.push({ x: x - 1, y, dir: 'left' });
    }

    return neighbors;
  }

  removeWall(current, next, maze) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (dx === 1) {
      maze[current.y][current.x].walls.right = false;
      maze[next.y][next.x].walls.left = false;
    } else if (dx === -1) {
      maze[current.y][current.x].walls.left = false;
      maze[next.y][next.x].walls.right = false;
    } else if (dy === 1) {
      maze[current.y][current.x].walls.bottom = false;
      maze[next.y][next.x].walls.top = false;
    } else if (dy === -1) {
      maze[current.y][current.x].walls.top = false;
      maze[next.y][next.x].walls.bottom = false;
    }
  }

  drawMaze() {
    const graphics = this.add.graphics();
    graphics.lineStyle(this.wallThickness, 0x3333ff, 1);

    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = x * this.cellSize;
        const py = y * this.cellSize;

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
  }

  createWallColliders() {
    const halfThickness = this.wallThickness / 2;

    for (let y = 0; y < this.mazeSize; y++) {
      for (let x = 0; x < this.mazeSize; x++) {
        const cell = this.maze[y][x];
        const px = x * this.cellSize;
        const py = y * this.cellSize;

        if (cell.walls.top) {
          const wall = this.add.rectangle(
            px + this.cellSize / 2, 
            py, 
            this.cellSize, 
            this.wallThickness, 
            0x3333ff, 
            0
          );
          this.walls.add(wall);
        }
        if (cell.walls.right) {
          const wall = this.add.rectangle(
            px + this.cellSize, 
            py + this.cellSize / 2, 
            this.wallThickness, 
            this.cellSize, 
            0x3333ff, 
            0
          );
          this.walls.add(wall);
        }
        if (cell.walls.bottom) {
          const wall = this.add.rectangle(
            px + this.cellSize / 2, 
            py + this.cellSize, 
            this.cellSize, 
            this.wallThickness, 
            0x3333ff, 
            0
          );
          this.walls.add(wall);
        }
        if (cell.walls.left) {
          const wall = this.add.rectangle(
            px, 
            py + this.cellSize / 2, 
            this.wallThickness, 
            this.cellSize, 
            0x3333ff, 
            0
          );
          this.walls.add(wall);
        }
      }
    }
  }

  reachGoal() {
    this.score += 100;
    this.level += 1;
    this.seed = Date.now() % 1000000;
    this.scene.restart();
  }

  update() {
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(speed);
    }

    // 标准化对角线速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.setVelocity(
        this.player.body.velocity.x * 0.707,
        this.player.body.velocity.y * 0.707
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#111111',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: MazeScene
};

new Phaser.Game(config);