class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.totalTiles = 0;
    this.drawnTiles = 0;
    this.gridSize = 12;
    this.tileSize = 50;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建12x12的二维数组
    const grid = [];
    for (let i = 0; i < this.gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < this.gridSize; j++) {
        grid[i][j] = (i + j) % 2; // 0或1，用于交替颜色
      }
    }

    // 定义两种紫色
    const purpleLight = 0xB19CD9; // 浅紫色
    const purpleDark = 0x6A4C93;  // 深紫色

    // 创建 Graphics 对象绘制棋盘
    const graphics = this.add.graphics();

    // 计算居中偏移
    const offsetX = (this.scale.width - this.gridSize * this.tileSize) / 2;
    const offsetY = (this.scale.height - this.gridSize * this.tileSize) / 2;

    // 遍历二维数组绘制棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        // 根据二维数组值选择颜色
        const color = grid[row][col] === 0 ? purpleLight : purpleDark;
        
        // 设置填充颜色
        graphics.fillStyle(color, 1);
        
        // 绘制矩形格子
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        graphics.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 更新状态信号
        this.drawnTiles++;
      }
    }

    // 绘制边框使棋盘更清晰
    graphics.lineStyle(2, 0x4A2C63, 1);
    graphics.strokeRect(
      offsetX, 
      offsetY, 
      this.gridSize * this.tileSize, 
      this.gridSize * this.tileSize
    );

    // 计算总格子数
    this.totalTiles = this.gridSize * this.gridSize;

    // 添加文本显示状态信息
    const statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    statusText.setText([
      `Grid Size: ${this.gridSize}x${this.gridSize}`,
      `Total Tiles: ${this.totalTiles}`,
      `Drawn Tiles: ${this.drawnTiles}`,
      `Tile Size: ${this.tileSize}px`
    ]);

    // 添加标题
    const title = this.add.text(
      this.scale.width / 2,
      offsetY - 30,
      'Purple Checkerboard 12x12',
      {
        fontSize: '24px',
        color: '#B19CD9',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0.5);

    // 输出状态到控制台
    console.log('Checkerboard created successfully!');
    console.log(`Total tiles: ${this.totalTiles}`);
    console.log(`Drawn tiles: ${this.drawnTiles}`);
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);