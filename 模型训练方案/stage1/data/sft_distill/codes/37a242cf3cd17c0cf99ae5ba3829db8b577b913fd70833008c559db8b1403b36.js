class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.tilesRendered = 0;
    this.boardSize = 5;
    this.isComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const tileSize = 80; // 每个格子的大小
    const startX = 100;  // 棋盘起始X坐标
    const startY = 100;  // 棋盘起始Y坐标

    // 定义两种粉色
    const lightPink = 0xFFB6C1; // 浅粉色
    const darkPink = 0xFF69B4;  // 深粉色

    // 创建 5x5 二维数组
    const board = [];
    for (let row = 0; row < this.boardSize; row++) {
      board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        board[row][col] = 1; // 填充数组
      }
    }

    // 使用 Graphics 创建两种粉色纹理
    const graphics = this.add.graphics();

    // 创建浅粉色纹理
    graphics.fillStyle(lightPink, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('lightPinkTile', tileSize, tileSize);
    graphics.clear();

    // 创建深粉色纹理
    graphics.fillStyle(darkPink, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('darkPinkTile', tileSize, tileSize);
    graphics.clear();

    // 销毁 graphics 对象
    graphics.destroy();

    // 根据二维数组绘制棋盘格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = startX + col * tileSize;
        const y = startY + row * tileSize;

        // 根据行列索引的奇偶性决定颜色
        const isLightTile = (row + col) % 2 === 0;
        const texture = isLightTile ? 'lightPinkTile' : 'darkPinkTile';

        // 创建方块
        const tile = this.add.image(x, y, texture);
        tile.setOrigin(0, 0); // 设置原点为左上角

        // 添加边框效果
        const border = this.add.graphics();
        border.lineStyle(2, 0xFFFFFF, 0.3);
        border.strokeRect(x, y, tileSize, tileSize);

        this.tilesRendered++;
      }
    }

    // 标记完成状态
    this.isComplete = true;

    // 添加标题文字
    const title = this.add.text(400, 30, 'Pink Checkerboard 5x5', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#FF1493',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5, 0.5);

    // 添加状态信息
    const statusText = this.add.text(400, 550, 
      `Tiles Rendered: ${this.tilesRendered} / ${this.boardSize * this.boardSize}\nStatus: Complete`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#333333',
      align: 'center'
    });
    statusText.setOrigin(0.5, 0.5);

    // 添加调试信息
    console.log('Checkerboard created successfully');
    console.log('Board size:', this.boardSize, 'x', this.boardSize);
    console.log('Total tiles:', this.tilesRendered);
    console.log('Completion status:', this.isComplete);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#F5F5F5',
  scene: CheckerboardScene
};

// 创建游戏实例
const game = new Phaser.Game(config);