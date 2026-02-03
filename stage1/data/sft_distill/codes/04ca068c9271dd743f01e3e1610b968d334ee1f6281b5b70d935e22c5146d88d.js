class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.tilesRendered = 0; // 状态信号：已渲染的格子数量
    this.gridSize = 12; // 棋盘格尺寸
    this.tileSize = 50; // 每个格子的像素大小
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 定义两种紫色
    const purpleLight = 0xB19CD9; // 浅紫色
    const purpleDark = 0x7B68EE; // 深紫色

    // 创建 12x12 的二维数组
    const board = [];
    for (let row = 0; row < this.gridSize; row++) {
      board[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 根据行列索引奇偶性决定颜色
        // (row + col) 为偶数时使用浅紫色，奇数时使用深紫色
        board[row][col] = (row + col) % 2 === 0 ? purpleLight : purpleDark;
      }
    }

    // 创建 Graphics 对象用于绘制
    const graphics = this.add.graphics();

    // 计算居中偏移量
    const boardWidth = this.gridSize * this.tileSize;
    const boardHeight = this.gridSize * this.tileSize;
    const offsetX = (this.cameras.main.width - boardWidth) / 2;
    const offsetY = (this.cameras.main.height - boardHeight) / 2;

    // 遍历二维数组并绘制棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const color = board[row][col];
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;

        // 设置填充颜色并绘制矩形
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, this.tileSize, this.tileSize);

        // 绘制边框以区分格子
        graphics.lineStyle(1, 0x000000, 0.3);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);

        // 更新状态信号
        this.tilesRendered++;
      }
    }

    // 添加文本显示状态信号
    const statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    statusText.setText(`Tiles Rendered: ${this.tilesRendered}/${this.gridSize * this.gridSize}`);

    // 添加标题
    const title = this.add.text(
      this.cameras.main.width / 2,
      20,
      'Purple Checkerboard 12x12',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0);

    // 输出验证信息到控制台
    console.log('Checkerboard created successfully!');
    console.log(`Grid size: ${this.gridSize}x${this.gridSize}`);
    console.log(`Tiles rendered: ${this.tilesRendered}`);
    console.log(`Board array sample:`, board[0].slice(0, 4));
  }

  update(time, delta) {
    // 本例无需每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene,
  parent: 'game-container' // 可选：指定挂载的 DOM 容器
};

// 创建游戏实例
const game = new Phaser.Game(config);