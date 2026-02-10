class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.gridSize = 12;
    this.tileSize = 50;
    this.tilesDrawn = 0;
    this.isComplete = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建 12x12 二维数组表示棋盘格
    const grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        grid[row][col] = (row + col) % 2; // 0 或 1，用于交替颜色
      }
    }

    // 创建 Graphics 对象用于绘制
    const graphics = this.add.graphics();

    // 定义两种颜色（白色和浅灰色）
    const color1 = 0xFFFFFF; // 白色
    const color2 = 0xCCCCCC; // 浅灰色

    // 计算居中偏移量
    const totalWidth = this.gridSize * this.tileSize;
    const totalHeight = this.gridSize * this.tileSize;
    const offsetX = (this.cameras.main.width - totalWidth) / 2;
    const offsetY = (this.cameras.main.height - totalHeight) / 2;

    // 遍历二维数组绘制棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        // 根据数组值选择颜色
        const color = grid[row][col] === 0 ? color1 : color2;
        
        // 设置填充颜色
        graphics.fillStyle(color, 1);
        
        // 绘制矩形
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        graphics.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制边框以清晰显示格子
        graphics.lineStyle(1, 0x888888, 1);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
        
        // 更新状态信号
        this.tilesDrawn++;
      }
    }

    // 标记完成状态
    this.isComplete = true;

    // 添加文本显示状态信息
    const statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });
    
    statusText.setText([
      `Grid Size: ${this.gridSize}x${this.gridSize}`,
      `Tiles Drawn: ${this.tilesDrawn}`,
      `Status: ${this.isComplete ? 'Complete' : 'In Progress'}`
    ]);

    // 添加标题
    const title = this.add.text(
      this.cameras.main.width / 2,
      offsetY - 40,
      'Checkerboard Pattern',
      {
        fontSize: '24px',
        fill: '#000000',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0.5);

    // 在控制台输出状态信息
    console.log('Checkerboard created:');
    console.log('- Grid size:', this.gridSize);
    console.log('- Total tiles:', this.tilesDrawn);
    console.log('- Completion status:', this.isComplete);
  }

  update(time, delta) {
    // 本示例无需更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#f0f0f0',
  scene: CheckerboardScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);