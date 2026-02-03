class ChessboardScene extends Phaser.Scene {
  constructor() {
    super('ChessboardScene');
    this.gridSize = 20; // 20x20 网格
    this.tileSize = 30; // 每个格子的像素大小
    this.totalTiles = 0; // 状态信号：总格子数
    this.lightTiles = 0; // 状态信号：浅色格子数
    this.darkTiles = 0; // 状态信号：深色格子数
    this.gridData = []; // 二维数组存储棋盘数据
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化二维数组
    for (let row = 0; row < this.gridSize; row++) {
      this.gridData[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 根据行列索引奇偶性确定颜色类型 (0=浅青色, 1=深青色)
        this.gridData[row][col] = (row + col) % 2;
      }
    }

    // 定义两种青色
    const lightCyan = 0x00FFFF; // 浅青色
    const darkCyan = 0x008B8B;  // 深青色

    // 计算棋盘居中位置
    const boardWidth = this.gridSize * this.tileSize;
    const boardHeight = this.gridSize * this.tileSize;
    const startX = (this.cameras.main.width - boardWidth) / 2;
    const startY = (this.cameras.main.height - boardHeight) / 2;

    // 绘制棋盘
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = startX + col * this.tileSize;
        const y = startY + row * this.tileSize;
        
        // 根据二维数组值选择颜色
        const color = this.gridData[row][col] === 0 ? lightCyan : darkCyan;
        
        // 使用 Rectangle 绘制每个格子
        const tile = this.add.rectangle(
          x + this.tileSize / 2,
          y + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          color
        );

        // 添加边框效果
        tile.setStrokeStyle(1, 0x006666, 0.3);

        // 更新状态统计
        this.totalTiles++;
        if (this.gridData[row][col] === 0) {
          this.lightTiles++;
        } else {
          this.darkTiles++;
        }
      }
    }

    // 添加标题文本
    this.add.text(
      this.cameras.main.width / 2,
      20,
      'Cyan Chessboard 20x20',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#00FFFF',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setOrigin(0.5);

    // 添加状态信息文本
    this.add.text(
      10,
      this.cameras.main.height - 60,
      `Total Tiles: ${this.totalTiles}\nLight Cyan: ${this.lightTiles}\nDark Cyan: ${this.darkTiles}`,
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );

    // 在控制台输出验证信息
    console.log('Chessboard created successfully!');
    console.log('Grid Data (first 3 rows):', this.gridData.slice(0, 3));
    console.log('Statistics:', {
      totalTiles: this.totalTiles,
      lightTiles: this.lightTiles,
      darkTiles: this.darkTiles,
      gridSize: this.gridSize
    });
  }

  update(time, delta) {
    // 棋盘是静态的，不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#1a1a1a',
  scene: ChessboardScene,
  pixelArt: false,
  antialias: true
};

// 创建游戏实例
new Phaser.Game(config);