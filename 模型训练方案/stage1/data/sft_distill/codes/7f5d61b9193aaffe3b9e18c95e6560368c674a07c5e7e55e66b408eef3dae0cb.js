class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.boardSize = 15;
    this.tileSize = 40;
    this.boardData = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化 15x15 二维数组
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        this.boardData[row][col] = (row + col) % 2; // 0 或 1，用于交替颜色
      }
    }

    // 定义两种绿色
    const color1 = 0x2ecc71; // 亮绿色
    const color2 = 0x27ae60; // 深绿色

    // 计算棋盘起始位置（居中）
    const boardWidth = this.boardSize * this.tileSize;
    const boardHeight = this.boardSize * this.tileSize;
    const startX = (this.cameras.main.width - boardWidth) / 2;
    const startY = (this.cameras.main.height - boardHeight) / 2;

    // 绘制棋盘格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = startX + col * this.tileSize;
        const y = startY + row * this.tileSize;
        const colorValue = this.boardData[row][col];
        const fillColor = colorValue === 0 ? color1 : color2;

        // 使用 Rectangle 绘制每个格子
        const tile = this.add.rectangle(
          x + this.tileSize / 2,
          y + this.tileSize / 2,
          this.tileSize,
          this.tileSize,
          fillColor
        );

        // 添加边框以便更清晰地看到格子
        tile.setStrokeStyle(1, 0x1a5c3a, 0.3);
      }
    }

    // 添加标题文本
    this.add.text(
      this.cameras.main.width / 2,
      20,
      '15x15 Checkerboard',
      {
        fontSize: '32px',
        color: '#2ecc71',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // 输出验证信号
    window.__signals__ = {
      boardSize: this.boardSize,
      tileSize: this.tileSize,
      totalTiles: this.boardSize * this.boardSize,
      boardData: this.boardData,
      color1Tiles: this.countTilesByColor(0),
      color2Tiles: this.countTilesByColor(1),
      timestamp: Date.now(),
      status: 'board_created'
    };

    // 输出日志 JSON
    console.log(JSON.stringify({
      type: 'checkerboard_created',
      boardSize: this.boardSize,
      totalTiles: this.boardSize * this.boardSize,
      alternatingPattern: true
    }));
  }

  // 辅助方法：统计某种颜色的格子数量
  countTilesByColor(colorValue) {
    let count = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.boardData[row][col] === colorValue) {
          count++;
        }
      }
    }
    return count;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#1a1a1a',
  scene: CheckerboardScene
};

new Phaser.Game(config);