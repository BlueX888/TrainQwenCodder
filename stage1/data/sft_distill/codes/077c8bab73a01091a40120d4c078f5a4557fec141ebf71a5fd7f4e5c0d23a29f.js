class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.boardSize = 15;
    this.tileSize = 40;
    this.totalTiles = 0;
    this.lightTileCount = 0;
    this.darkTileCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建15x15的二维数组，交替填充0和1
    const boardData = [];
    for (let row = 0; row < this.boardSize; row++) {
      boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 棋盘格模式：(row + col) % 2 决定颜色
        boardData[row][col] = (row + col) % 2;
      }
    }

    // 定义两种粉色
    const lightPink = 0xFFB6C1;  // 浅粉色
    const darkPink = 0xFF69B4;   // 深粉色

    // 计算棋盘居中位置
    const offsetX = (this.cameras.main.width - this.boardSize * this.tileSize) / 2;
    const offsetY = (this.cameras.main.height - this.boardSize * this.tileSize) / 2;

    // 绘制棋盘
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        const colorValue = boardData[row][col];
        const color = colorValue === 0 ? lightPink : darkPink;

        // 使用 Rectangle 绘制每个格子
        const tile = this.add.rectangle(
          x + this.tileSize / 2,
          y + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          color
        );

        // 添加边框以区分格子
        tile.setStrokeStyle(1, 0xFFFFFF, 0.3);

        // 更新统计信息
        this.totalTiles++;
        if (colorValue === 0) {
          this.lightTileCount++;
        } else {
          this.darkTileCount++;
        }
      }
    }

    // 添加标题文本
    this.add.text(
      this.cameras.main.width / 2,
      20,
      'Pink Checkerboard 15x15',
      {
        fontSize: '24px',
        color: '#FF1493',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // 显示统计信息
    const statsText = `Total Tiles: ${this.totalTiles}\nLight Pink: ${this.lightTileCount}\nDark Pink: ${this.darkTileCount}`;
    this.add.text(
      10,
      this.cameras.main.height - 80,
      statsText,
      {
        fontSize: '14px',
        color: '#FF1493',
        backgroundColor: '#ffffff',
        padding: { x: 10, y: 5 }
      }
    );

    // 在控制台输出状态信息用于验证
    console.log('Checkerboard created successfully!');
    console.log(`Board size: ${this.boardSize}x${this.boardSize}`);
    console.log(`Total tiles: ${this.totalTiles}`);
    console.log(`Light pink tiles: ${this.lightTileCount}`);
    console.log(`Dark pink tiles: ${this.darkTileCount}`);
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// Phaser 游戏配置
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