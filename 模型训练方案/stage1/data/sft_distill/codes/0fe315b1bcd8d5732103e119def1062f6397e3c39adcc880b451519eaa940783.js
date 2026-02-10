class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.boardData = [];
    this.tileSize = 80;
    this.boardSize = 5;
    this.color1 = 0xFFFFFF; // 白色
    this.color2 = 0x333333; // 深灰色
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化二维数组
    this.initBoardData();
    
    // 绘制棋盘格
    this.drawCheckerboard();
    
    // 添加标题文本
    this.add.text(10, 10, 'Checkerboard 5x5', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 输出验证信号
    this.outputSignals();
  }

  initBoardData() {
    // 生成5x5二维数组，交替填充0和1
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 棋盘格交替规则：(row + col) % 2
        this.boardData[row][col] = (row + col) % 2;
      }
    }
  }

  drawCheckerboard() {
    const graphics = this.add.graphics();
    const offsetX = 100;
    const offsetY = 100;

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        
        // 根据二维数组值选择颜色
        const color = this.boardData[row][col] === 0 ? this.color1 : this.color2;
        
        // 绘制方格
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制边框
        graphics.lineStyle(2, 0x666666, 1);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
        
        // 添加坐标文本
        this.add.text(x + 5, y + 5, `${row},${col}`, {
          fontSize: '12px',
          color: this.boardData[row][col] === 0 ? '#000000' : '#ffffff'
        });
      }
    }
  }

  outputSignals() {
    // 计算统计信息
    let whiteCount = 0;
    let darkCount = 0;
    
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        if (this.boardData[row][col] === 0) {
          whiteCount++;
        } else {
          darkCount++;
        }
      }
    }

    // 输出验证信号
    window.__signals__ = {
      boardSize: this.boardSize,
      totalTiles: this.boardSize * this.boardSize,
      whiteCount: whiteCount,
      darkCount: darkCount,
      boardData: this.boardData,
      tileSize: this.tileSize,
      completed: true
    };

    // 控制台输出JSON格式的信号
    console.log('=== Checkerboard Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
    
    // 在屏幕上显示统计信息
    this.add.text(10, 50, `White Tiles: ${whiteCount} | Dark Tiles: ${darkCount}`, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#222222',
  scene: CheckerboardScene
};

const game = new Phaser.Game(config);