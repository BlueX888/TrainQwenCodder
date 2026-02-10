class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.gridRows = 20;
    this.gridCols = 20;
    this.tileSize = 30;
    this.tilesGenerated = 0; // 状态信号：已生成的格子数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建二维数组存储棋盘数据
    this.boardData = [];
    for (let row = 0; row < this.gridRows; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.gridCols; col++) {
        // 棋盘格交替模式：(row + col) % 2
        this.boardData[row][col] = (row + col) % 2;
      }
    }

    // 创建 Graphics 对象用于绘制
    const graphics = this.add.graphics();

    // 定义两种橙色
    const orangeLight = 0xFFA500; // 亮橙色
    const orangeDark = 0xFF8C00;  // 深橙色

    // 居中显示棋盘
    const offsetX = (this.scale.width - this.gridCols * this.tileSize) / 2;
    const offsetY = (this.scale.height - this.gridRows * this.tileSize) / 2;

    // 遍历二维数组绘制棋盘
    for (let row = 0; row < this.gridRows; row++) {
      for (let col = 0; col < this.gridCols; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;

        // 根据数组值选择颜色
        const color = this.boardData[row][col] === 0 ? orangeLight : orangeDark;
        
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, this.tileSize, this.tileSize);

        // 添加边框使格子更清晰
        graphics.lineStyle(1, 0x000000, 0.2);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);

        this.tilesGenerated++;
      }
    }

    // 添加标题文本
    const title = this.add.text(
      this.scale.width / 2,
      20,
      'Orange Checkerboard 20x20',
      {
        fontSize: '24px',
        color: '#FF8C00',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0);

    // 显示状态信息
    const statusText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 30,
      `Tiles Generated: ${this.tilesGenerated} / ${this.gridRows * this.gridCols}`,
      {
        fontSize: '16px',
        color: '#FFFFFF',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    statusText.setOrigin(0.5, 0);

    // 输出验证信息到控制台
    console.log('Checkerboard created successfully!');
    console.log(`Grid Size: ${this.gridRows}x${this.gridCols}`);
    console.log(`Total Tiles: ${this.tilesGenerated}`);
    console.log('Board Data Sample (first 3 rows):`, this.boardData.slice(0, 3));
  }

  update(time, delta) {
    // 棋盘是静态的，不需要更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);