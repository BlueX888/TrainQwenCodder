class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.boardData = [];
    this.tileSize = 80;
    this.boardSize = 5;
    this.color1 = 0xFFFFFF; // 白色
    this.color2 = 0xCCCCCC; // 浅灰色
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化二维数组
    this.initBoardData();
    
    // 绘制棋盘格
    this.drawCheckerboard();
    
    // 输出可验证的状态信号
    this.exportSignals();
    
    // 添加标题文本
    this.add.text(400, 30, '5x5 棋盘格地图', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 显示棋盘信息
    this.add.text(400, 480, `棋盘尺寸: ${this.boardSize}x${this.boardSize}`, {
      fontSize: '18px',
      color: '#000000'
    }).setOrigin(0.5);
    
    console.log('棋盘数据:', JSON.stringify({
      size: this.boardSize,
      tileSize: this.tileSize,
      boardData: this.boardData
    }));
  }

  initBoardData() {
    // 创建 5x5 二维数组，交替存储颜色索引
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 棋盘格模式：(row + col) % 2 决定颜色
        const colorIndex = (row + col) % 2;
        this.boardData[row][col] = colorIndex;
      }
    }
  }

  drawCheckerboard() {
    const graphics = this.add.graphics();
    
    // 计算起始位置（居中显示）
    const startX = (800 - this.boardSize * this.tileSize) / 2;
    const startY = (600 - this.boardSize * this.tileSize) / 2;
    
    // 遍历二维数组绘制棋盘格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = startX + col * this.tileSize;
        const y = startY + row * this.tileSize;
        
        // 根据数组值选择颜色
        const color = this.boardData[row][col] === 0 ? this.color1 : this.color2;
        
        // 绘制方块
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制边框
        graphics.lineStyle(2, 0x666666, 1);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
        
        // 添加坐标标签
        this.add.text(
          x + this.tileSize / 2,
          y + this.tileSize / 2,
          `${row},${col}`,
          {
            fontSize: '14px',
            color: '#333333'
          }
        ).setOrigin(0.5);
      }
    }
  }

  exportSignals() {
    // 导出可验证的状态信号
    window.__signals__ = {
      boardSize: this.boardSize,
      tileSize: this.tileSize,
      totalTiles: this.boardSize * this.boardSize,
      boardData: this.boardData,
      color1: this.color1,
      color2: this.color2,
      whiteCount: this.countColorTiles(0),
      grayCount: this.countColorTiles(1),
      timestamp: Date.now(),
      status: 'complete'
    };
    
    console.log('Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  countColorTiles(colorIndex) {
    let count = 0;
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.boardData[row][col] === colorIndex) {
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
  height: 600,
  backgroundColor: '#F0F0F0',
  scene: CheckerboardScene
};

new Phaser.Game(config);