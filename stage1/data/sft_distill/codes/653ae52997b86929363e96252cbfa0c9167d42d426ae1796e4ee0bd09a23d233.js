class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.boardData = [];
    this.tileSize = 64;
    this.boardSize = 8;
    this.lightTileCount = 0;
    this.darkTileCount = 0;
    this.totalTiles = 0;
  }

  preload() {
    // 使用 Graphics 创建两种青色纹理
    this.createTileTextures();
  }

  create() {
    // 生成 8x8 棋盘格数据
    this.generateBoardData();
    
    // 渲染棋盘格
    this.renderBoard();
    
    // 显示状态信息
    this.displayStats();
    
    console.log('Checkerboard created successfully!');
    console.log('Total tiles:', this.totalTiles);
    console.log('Light tiles:', this.lightTileCount);
    console.log('Dark tiles:', this.darkTileCount);
  }

  createTileTextures() {
    // 创建浅青色纹理
    const lightGraphics = this.add.graphics();
    lightGraphics.fillStyle(0x00CED1, 1); // 浅青色 (Dark Turquoise)
    lightGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    lightGraphics.lineStyle(2, 0x008B8B, 1); // 深青色边框
    lightGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    lightGraphics.generateTexture('lightTile', this.tileSize, this.tileSize);
    lightGraphics.destroy();

    // 创建深青色纹理
    const darkGraphics = this.add.graphics();
    darkGraphics.fillStyle(0x008B8B, 1); // 深青色 (Dark Cyan)
    darkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    darkGraphics.lineStyle(2, 0x006666, 1); // 更深的边框
    darkGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    darkGraphics.generateTexture('darkTile', this.tileSize, this.tileSize);
    darkGraphics.destroy();
  }

  generateBoardData() {
    // 生成 8x8 交替的棋盘格数据
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 棋盘格模式：(row + col) % 2 决定颜色
        const tileValue = (row + col) % 2;
        this.boardData[row][col] = tileValue;
        
        // 统计数量
        if (tileValue === 0) {
          this.lightTileCount++;
        } else {
          this.darkTileCount++;
        }
        this.totalTiles++;
      }
    }
  }

  renderBoard() {
    // 计算棋盘居中位置
    const boardWidth = this.boardSize * this.tileSize;
    const boardHeight = this.boardSize * this.tileSize;
    const startX = (this.cameras.main.width - boardWidth) / 2;
    const startY = (this.cameras.main.height - boardHeight) / 2 + 40;

    // 遍历数组绘制棋盘格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = startX + col * this.tileSize;
        const y = startY + row * this.tileSize;
        const tileValue = this.boardData[row][col];
        
        // 根据数据值选择纹理
        const textureName = tileValue === 0 ? 'lightTile' : 'darkTile';
        const tile = this.add.image(x, y, textureName);
        tile.setOrigin(0, 0);
        
        // 添加坐标标记（可选，用于调试）
        if (row === 0 || col === 0) {
          const label = this.add.text(
            x + this.tileSize / 2,
            y + this.tileSize / 2,
            `${row},${col}`,
            {
              fontSize: '10px',
              color: '#ffffff',
              backgroundColor: '#00000088'
            }
          );
          label.setOrigin(0.5);
        }
      }
    }
  }

  displayStats() {
    // 显示棋盘统计信息
    const statsText = this.add.text(20, 20, '', {
      fontSize: '18px',
      color: '#00CED1',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    
    statsText.setText([
      '=== Checkerboard Stats ===',
      `Board Size: ${this.boardSize}x${this.boardSize}`,
      `Total Tiles: ${this.totalTiles}`,
      `Light Tiles: ${this.lightTileCount}`,
      `Dark Tiles: ${this.darkTileCount}`,
      `Tile Size: ${this.tileSize}px`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#1a1a1a',
  scene: CheckerboardScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);