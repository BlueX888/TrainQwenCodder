class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.gridSize = 12;
    this.tileSize = 50;
    this.tilesDrawn = 0;
    this.totalTiles = this.gridSize * this.gridSize;
    this.isComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建12x12的二维数组
    const boardData = [];
    for (let y = 0; y < this.gridSize; y++) {
      boardData[y] = [];
      for (let x = 0; x < this.gridSize; x++) {
        // 棋盘格模式：(x + y) % 2 决定颜色
        boardData[y][x] = (x + y) % 2;
      }
    }

    // 创建两种颜色的纹理
    this.createTileTextures();

    // 绘制棋盘格
    this.drawCheckerboard(boardData);

    // 添加信息文本显示状态
    this.add.text(10, 10, `Grid Size: ${this.gridSize}x${this.gridSize}`, {
      fontSize: '18px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 40, `Total Tiles: ${this.totalTiles}`, {
      fontSize: '18px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 70, `Status: ${this.isComplete ? 'Complete' : 'Drawing...'}`, {
      fontSize: '18px',
      color: '#000000',
      backgroundColor: '#ffffff',
      padding: { x: 10, y: 5 }
    });

    // 标记完成
    this.isComplete = true;
    console.log('Checkerboard created:', {
      gridSize: this.gridSize,
      totalTiles: this.totalTiles,
      tilesDrawn: this.tilesDrawn,
      isComplete: this.isComplete
    });
  }

  createTileTextures() {
    // 创建白色方块纹理
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0xffffff, 1);
    graphics1.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics1.lineStyle(1, 0xcccccc, 1);
    graphics1.strokeRect(0, 0, this.tileSize, this.tileSize);
    graphics1.generateTexture('whiteTile', this.tileSize, this.tileSize);
    graphics1.destroy();

    // 创建浅灰色方块纹理
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xe0e0e0, 1);
    graphics2.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics2.lineStyle(1, 0xcccccc, 1);
    graphics2.strokeRect(0, 0, this.tileSize, this.tileSize);
    graphics2.generateTexture('grayTile', this.tileSize, this.tileSize);
    graphics2.destroy();
  }

  drawCheckerboard(boardData) {
    // 计算居中偏移
    const totalWidth = this.gridSize * this.tileSize;
    const totalHeight = this.gridSize * this.tileSize;
    const offsetX = (this.cameras.main.width - totalWidth) / 2;
    const offsetY = (this.cameras.main.height - totalHeight) / 2;

    // 创建容器用于组织棋盘格
    const container = this.add.container(offsetX, offsetY);

    // 遍历二维数组绘制棋盘格
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const tileType = boardData[y][x];
        const textureName = tileType === 0 ? 'whiteTile' : 'grayTile';
        
        // 创建方块精灵
        const tile = this.add.image(
          x * this.tileSize,
          y * this.tileSize,
          textureName
        );
        tile.setOrigin(0, 0);
        
        // 添加到容器
        container.add(tile);
        
        // 更新计数
        this.tilesDrawn++;
      }
    }

    // 添加边框
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(3, 0x333333, 1);
    borderGraphics.strokeRect(
      offsetX - 1.5,
      offsetY - 1.5,
      totalWidth + 3,
      totalHeight + 3
    );
  }

  update(time, delta) {
    // 棋盘格是静态的，不需要更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#f5f5f5',
  scene: CheckerboardScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);