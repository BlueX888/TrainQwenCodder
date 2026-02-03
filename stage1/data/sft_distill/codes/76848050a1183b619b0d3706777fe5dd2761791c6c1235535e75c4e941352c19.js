class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.gridSize = 5;
    this.tileSize = 80;
    this.checkerboard = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化 5x5 二维数组
    for (let row = 0; row < this.gridSize; row++) {
      this.checkerboard[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 根据行列索引决定颜色类型（0=白色，1=灰色）
        this.checkerboard[row][col] = (row + col) % 2;
      }
    }

    // 计算棋盘居中位置
    const offsetX = (this.cameras.main.width - this.gridSize * this.tileSize) / 2;
    const offsetY = (this.cameras.main.height - this.gridSize * this.tileSize) / 2;

    // 绘制棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        
        // 根据数组值选择颜色
        const color = this.checkerboard[row][col] === 0 ? 0xFFFFFF : 0x808080;
        
        // 使用 Rectangle 绘制格子
        const tile = this.add.rectangle(
          x + this.tileSize / 2,
          y + this.tileSize / 2,
          this.tileSize - 2, // 留2像素间隙
          this.tileSize - 2,
          color
        );
        
        // 添加边框效果
        tile.setStrokeStyle(2, 0x000000);
        
        // 添加坐标文本（可选，便于调试）
        this.add.text(
          x + 10,
          y + 10,
          `${row},${col}`,
          {
            fontSize: '12px',
            color: color === 0xFFFFFF ? '#000000' : '#FFFFFF'
          }
        );
      }
    }

    // 添加标题
    this.add.text(
      this.cameras.main.width / 2,
      20,
      '5x5 Checkerboard',
      {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);

    // 输出验证信号
    this.setupSignals();
    
    console.log('Checkerboard created:', JSON.stringify({
      gridSize: this.gridSize,
      tileSize: this.tileSize,
      totalTiles: this.gridSize * this.gridSize,
      pattern: this.checkerboard
    }));
  }

  setupSignals() {
    // 统计白色和灰色格子数量
    let whiteCount = 0;
    let grayCount = 0;
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.checkerboard[row][col] === 0) {
          whiteCount++;
        } else {
          grayCount++;
        }
      }
    }

    // 输出可验证的状态信号
    window.__signals__ = {
      gridSize: this.gridSize,
      tileSize: this.tileSize,
      totalTiles: this.gridSize * this.gridSize,
      whiteCount: whiteCount,
      grayCount: grayCount,
      checkerboardPattern: this.checkerboard,
      isValid: whiteCount + grayCount === this.gridSize * this.gridSize,
      timestamp: Date.now()
    };

    console.log('Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  update(time, delta) {
    // 棋盘是静态的，无需更新
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#F0F0F0',
  scene: CheckerboardScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);