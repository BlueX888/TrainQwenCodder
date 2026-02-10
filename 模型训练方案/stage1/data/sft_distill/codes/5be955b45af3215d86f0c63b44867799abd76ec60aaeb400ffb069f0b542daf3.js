class MazeScene extends Phaser.Scene {
  constructor() {
    super('MazeScene');
    this.currentSeed = null;
    this.mazeGrid = null;
    this.cellSize = 150;
    this.wallThickness = 10;
    this.player = null;
    this.goal = null;
    this.level = 1;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成随机种子（或使用固定种子便于测试）
    this.currentSeed = Date.now().toString().slice(-8);
    
    // 初始化 Phaser 的随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
    
    // 生成迷宫
    this.mazeGrid = this.generateMaze(3, 3);
    
    // 绘制迷宫
    this.drawMaze();
    
    // 显示种子信息
    this.seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示关卡信息
    this.levelText = this.add.text(10, 50, `Level: ${this.level}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 创建玩家（起点：左上角）
    this.createPlayer(0, 0);
    
    // 创建目标（终点：右下角）
    this.createGoal(2, 2);
    
    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加重新生成按钮提示
    this.add.text(10, 90, 'Press R to regenerate', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 监听 R 键重新生成迷宫
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
  }

  /**
   * 使用深度优先搜索生成迷宫
   * @param {number} rows - 行数
   * @param {number} cols - 列数
   * @returns {Array} 迷宫网格
   */
  generateMaze(rows, cols) {
    // 初始化网格，每个单元格有四面墙 {top, right, bottom, left}
    const grid = [];
    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        grid[r][c] = {
          visited: false,
          walls: { top: true, right: true, bottom: true, left: true }
        };
      }
    }
    
    // DFS 生成迷宫
    const stack = [];
    let current = { row: 0, col: 0 };
    grid[0][0].visited = true;
    
    while (true) {
      const neighbors = this.getUnvisitedNeighbors(current, grid, rows, cols);
      
      if (neighbors.length > 0) {
        // 随机选择一个未访问的邻居
        const next = neighbors[this.rnd.between(0, neighbors.length - 1)];
        
        // 移除当前单元格和邻居之间的墙
        this.removeWall(current, next, grid);
        
        // 标记邻居为已访问
        grid[next.row][next.col].visited = true;
        
        // 压栈
        stack.push(current);
        current = next;
      } else if (stack.length > 0) {
        // 回溯
        current = stack.pop();
      } else {
        break;
      }
    }
    
    return grid;
  }

  /**
   * 获取未访问的邻居
   */
  getUnvisitedNeighbors(cell, grid, rows, cols) {
    const neighbors = [];
    const { row, col } = cell;
    
    // 上
    if (row > 0 && !grid[row - 1][col].visited) {
      neighbors.push({ row: row - 1, col: col, direction: 'top' });
    }
    // 右
    if (col < cols - 1 && !grid[row][col + 1].visited) {
      neighbors.push({ row: row, col: col + 1, direction: 'right' });
    }
    // 下
    if (row < rows - 1 && !grid[row + 1][col].visited) {
      neighbors.push({ row: row + 1, col: col, direction: 'bottom' });
    }
    // 左
    if (col > 0 && !grid[row][col - 1].visited) {
      neighbors.push({ row: row, col: col - 1, direction: 'left' });
    }
    
    return neighbors;
  }

  /**
   * 移除两个单元格之间的墙
   */
  removeWall(current, next, grid) {
    const rowDiff = current.row - next.row;
    const colDiff = current.col - next.col;
    
    if (rowDiff === 1) { // 邻居在上方
      grid[current.row][current.col].walls.top = false;
      grid[next.row][next.col].walls.bottom = false;
    } else if (rowDiff === -1) { // 邻居在下方
      grid[current.row][current.col].walls.bottom = false;
      grid[next.row][next.col].walls.top = false;
    } else if (colDiff === 1) { // 邻居在左侧
      grid[current.row][current.col].walls.left = false;
      grid[next.row][next.col].walls.right = false;
    } else if (colDiff === -1) { // 邻居在右侧
      grid[current.row][current.col].walls.right = false;
      grid[next.row][next.col].walls.left = false;
    }
  }

  /**
   * 绘制迷宫
   */
  drawMaze() {
    const graphics = this.add.graphics();
    graphics.lineStyle(this.wallThickness, 0xffffff, 1);
    
    const offsetX = 100;
    const offsetY = 150;
    
    for (let r = 0; r < this.mazeGrid.length; r++) {
      for (let c = 0; c < this.mazeGrid[r].length; c++) {
        const cell = this.mazeGrid[r][c];
        const x = offsetX + c * this.cellSize;
        const y = offsetY + r * this.cellSize;
        
        // 绘制墙壁
        if (cell.walls.top) {
          graphics.lineBetween(x, y, x + this.cellSize, y);
        }
        if (cell.walls.right) {
          graphics.lineBetween(x + this.cellSize, y, x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.bottom) {
          graphics.lineBetween(x, y + this.cellSize, x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
          graphics.lineBetween(x, y, x, y + this.cellSize);
        }
      }
    }
  }

  /**
   * 创建玩家
   */
  createPlayer(gridRow, gridCol) {
    const offsetX = 100;
    const offsetY = 150;
    const x = offsetX + gridCol * this.cellSize + this.cellSize / 2;
    const y = offsetY + gridRow * this.cellSize + this.cellSize / 2;
    
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(0, 0, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
    
    this.player = this.add.sprite(x, y, 'player');
    this.player.gridRow = gridRow;
    this.player.gridCol = gridCol;
    this.player.setDepth(10);
  }

  /**
   * 创建目标
   */
  createGoal(gridRow, gridCol) {
    const offsetX = 100;
    const offsetY = 150;
    const x = offsetX + gridCol * this.cellSize + this.cellSize / 2;
    const y = offsetY + gridRow * this.cellSize + this.cellSize / 2;
    
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(-15, -15, 30, 30);
    graphics.generateTexture('goal', 30, 30);
    graphics.destroy();
    
    this.goal = this.add.sprite(x, y, 'goal');
    this.goal.gridRow = gridRow;
    this.goal.gridCol = gridCol;
    this.goal.setDepth(5);
  }

  /**
   * 检查是否可以移动到指定方向
   */
  canMove(direction) {
    const currentCell = this.mazeGrid[this.player.gridRow][this.player.gridCol];
    return !currentCell.walls[direction];
  }

  /**
   * 移动玩家
   */
  movePlayer(direction, deltaRow, deltaCol) {
    if (this.canMove(direction)) {
      this.player.gridRow += deltaRow;
      this.player.gridCol += deltaCol;
      
      const offsetX = 100;
      const offsetY = 150;
      const targetX = offsetX + this.player.gridCol * this.cellSize + this.cellSize / 2;
      const targetY = offsetY + this.player.gridRow * this.cellSize + this.cellSize / 2;
      
      this.tweens.add({
        targets: this.player,
        x: targetX,
        y: targetY,
        duration: 200,
        ease: 'Power2'
      });
      
      // 检查是否到达目标
      if (this.player.gridRow === this.goal.gridRow && 
          this.player.gridCol === this.goal.gridCol) {
        this.reachGoal();
      }
    }
  }

  /**
   * 到达目标
   */
  reachGoal() {
    this.level++;
    this.add.text(400, 300, 'Level Complete!', {
      fontSize: '48px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 处理玩家移动（防止连续触发）
    if (this.cursors.up.isDown && Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.movePlayer('top', -1, 0);
    } else if (this.cursors.down.isDown && Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.movePlayer('bottom', 1, 0);
    } else if (this.cursors.left.isDown && Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.movePlayer('left', 0, -1);
    } else if (this.cursors.right.isDown && Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.movePlayer('right', 0, 1);
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: MazeScene
};

// 启动游戏
new Phaser.Game(config);