class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.gridSize = 12;
    this.tileSize = 50;
    this.tilesRendered = 0;
    this.renderComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建两种粉色纹理
    this.createPinkTextures();

    // 创建 12x12 的二维数组棋盘
    const checkerboard = this.createCheckerboardData();

    // 渲染棋盘
    this.renderCheckerboard(checkerboard);

    // 添加标题文本
    this.add.text(10, 10, 'Pink Checkerboard 12x12', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatus();

    console.log('Checkerboard created:', {
      gridSize: this.gridSize,
      tilesRendered: this.tilesRendered,
      renderComplete: this.renderComplete
    });
  }

  createPinkTextures() {
    // 创建浅粉色纹理
    const lightPinkGraphics = this.add.graphics();
    lightPinkGraphics.fillStyle(0xFFB6C1, 1); // Light Pink
    lightPinkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    lightPinkGraphics.generateTexture('lightPink', this.tileSize, this.tileSize);
    lightPinkGraphics.destroy();

    // 创建深粉色纹理
    const darkPinkGraphics = this.add.graphics();
    darkPinkGraphics.fillStyle(0xFF69B4, 1); // Hot Pink
    darkPinkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    darkPinkGraphics.generateTexture('darkPink', this.tileSize, this.tileSize);
    darkPinkGraphics.destroy();
  }

  createCheckerboardData() {
    // 创建 12x12 的二维数组
    const board = [];
    for (let row = 0; row < this.gridSize; row++) {
      board[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 根据行列索引的奇偶性决定颜色
        // (row + col) % 2 === 0 时使用浅粉色，否则使用深粉色
        board[row][col] = (row + col) % 2 === 0 ? 'lightPink' : 'darkPink';
      }
    }
    return board;
  }

  renderCheckerboard(board) {
    // 计算居中偏移
    const offsetX = (this.scale.width - this.gridSize * this.tileSize) / 2;
    const offsetY = (this.scale.height - this.gridSize * this.tileSize) / 2 + 40;

    // 遍历二维数组并渲染
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        const textureKey = board[row][col];

        // 创建图像对象
        const tile = this.add.image(x, y, textureKey);
        tile.setOrigin(0, 0);

        // 添加边框效果（可选）
        const border = this.add.graphics();
        border.lineStyle(1, 0xFFFFFF, 0.2);
        border.strokeRect(x, y, this.tileSize, this.tileSize);

        this.tilesRendered++;
      }
    }

    this.renderComplete = true;
  }

  updateStatus() {
    const expectedTiles = this.gridSize * this.gridSize;
    this.statusText.setText([
      `Grid Size: ${this.gridSize}x${this.gridSize}`,
      `Tiles Rendered: ${this.tilesRendered}/${expectedTiles}`,
      `Status: ${this.renderComplete ? 'Complete' : 'Rendering...'}`
    ]);
  }

  update(time, delta) {
    // 可以添加动画或交互逻辑
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