class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.gridSize = 12;
    this.tileSize = 50;
    this.totalTiles = 0;
    this.lightTiles = 0;
    this.darkTiles = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义两种灰色
    const lightGray = 0xcccccc;
    const darkGray = 0x666666;

    // 创建 Graphics 对象用于绘制
    const graphics = this.add.graphics();

    // 生成 12x12 的棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        // 根据行列索引的和的奇偶性决定颜色
        const isLight = (row + col) % 2 === 0;
        const color = isLight ? lightGray : darkGray;

        // 绘制方格
        graphics.fillStyle(color, 1);
        graphics.fillRect(
          col * this.tileSize,
          row * this.tileSize,
          this.tileSize,
          this.tileSize
        );

        // 统计瓦片数量
        this.totalTiles++;
        if (isLight) {
          this.lightTiles++;
        } else {
          this.darkTiles++;
        }
      }
    }

    // 添加边框以更清晰地显示棋盘
    graphics.lineStyle(2, 0x000000, 1);
    graphics.strokeRect(0, 0, this.gridSize * this.tileSize, this.gridSize * this.tileSize);

    // 添加文本显示状态信息
    const infoText = this.add.text(10, this.gridSize * this.tileSize + 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setText([
      `Grid Size: ${this.gridSize}x${this.gridSize}`,
      `Total Tiles: ${this.totalTiles}`,
      `Light Tiles: ${this.lightTiles}`,
      `Dark Tiles: ${this.darkTiles}`,
      `Tile Size: ${this.tileSize}px`
    ]);

    // 居中显示棋盘
    const boardWidth = this.gridSize * this.tileSize;
    const boardHeight = this.gridSize * this.tileSize;
    const offsetX = (this.cameras.main.width - boardWidth) / 2;
    const offsetY = (this.cameras.main.height - boardHeight - 80) / 2;
    
    graphics.setPosition(offsetX, offsetY);
    infoText.setPosition(offsetX, offsetY + boardHeight + 10);

    console.log('Checkerboard created successfully!');
    console.log(`Total tiles: ${this.totalTiles}, Light: ${this.lightTiles}, Dark: ${this.darkTiles}`);
  }

  update(time, delta) {
    // 棋盘为静态显示，不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 750,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

// 创建游戏实例
new Phaser.Game(config);