class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.boardData = [];
    this.tileSize = 64;
    this.boardSize = 8;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      boardSize: this.boardSize,
      tileSize: this.tileSize,
      totalTiles: 0,
      pinkTiles: 0,
      lightPinkTiles: 0,
      colors: {
        pink: '#FF69B4',      // 深粉色
        lightPink: '#FFB6C1'  // 浅粉色
      }
    };

    // 生成 8x8 二维数组，棋盘格模式
    this.generateBoardData();

    // 创建两种粉色纹理
    this.createTileTextures();

    // 渲染棋盘
    this.renderCheckerboard();

    // 添加标题文本
    this.add.text(this.boardSize * this.tileSize / 2, 20, 'Pink Checkerboard 8x8', {
      fontSize: '24px',
      color: '#FF1493',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 输出验证信息
    console.log('Checkerboard created:', JSON.stringify(window.__signals__, null, 2));
  }

  generateBoardData() {
    // 生成 8x8 棋盘格数组，交替 0 和 1
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 棋盘格模式：(row + col) % 2 决定颜色
        this.boardData[row][col] = (row + col) % 2;
      }
    }

    // 记录到验证信号
    window.__signals__.boardData = this.boardData;
  }

  createTileTextures() {
    // 创建深粉色纹理
    const pinkGraphics = this.add.graphics();
    pinkGraphics.fillStyle(0xFF69B4, 1); // 深粉色
    pinkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    pinkGraphics.generateTexture('pinkTile', this.tileSize, this.tileSize);
    pinkGraphics.destroy();

    // 创建浅粉色纹理
    const lightPinkGraphics = this.add.graphics();
    lightPinkGraphics.fillStyle(0xFFB6C1, 1); // 浅粉色
    lightPinkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    lightPinkGraphics.generateTexture('lightPinkTile', this.tileSize, this.tileSize);
    lightPinkGraphics.destroy();
  }

  renderCheckerboard() {
    const offsetX = 50; // 左边距
    const offsetY = 60; // 上边距（留空间给标题）

    // 遍历二维数组绘制棋盘
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        const tileValue = this.boardData[row][col];

        // 根据数组值选择纹理
        const textureName = tileValue === 0 ? 'pinkTile' : 'lightPinkTile';
        
        // 创建图块
        const tile = this.add.image(x, y, textureName);
        tile.setOrigin(0, 0);

        // 添加边框效果
        const border = this.add.graphics();
        border.lineStyle(1, 0xFFFFFF, 0.3);
        border.strokeRect(x, y, this.tileSize, this.tileSize);

        // 统计信息
        window.__signals__.totalTiles++;
        if (tileValue === 0) {
          window.__signals__.pinkTiles++;
        } else {
          window.__signals__.lightPinkTiles++;
        }
      }
    }

    // 添加坐标标签
    this.addCoordinateLabels(offsetX, offsetY);
  }

  addCoordinateLabels(offsetX, offsetY) {
    const labelStyle = {
      fontSize: '14px',
      color: '#666666'
    };

    // 添加列标签 (0-7)
    for (let col = 0; col < this.boardSize; col++) {
      const x = offsetX + col * this.tileSize + this.tileSize / 2;
      this.add.text(x, offsetY - 20, col.toString(), labelStyle).setOrigin(0.5);
    }

    // 添加行标签 (0-7)
    for (let row = 0; row < this.boardSize; row++) {
      const y = offsetY + row * this.tileSize + this.tileSize / 2;
      this.add.text(offsetX - 20, y, row.toString(), labelStyle).setOrigin(0.5);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 620,
  backgroundColor: '#F5F5F5',
  scene: CheckerboardScene
};

// 创建游戏实例
new Phaser.Game(config);