class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.boardSize = 5;
    this.tileSize = 80;
    this.tilesGenerated = 0;
    this.boardData = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化5x5二维数组，用0和1表示两种颜色
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 棋盘格交替模式：(row + col) % 2
        this.boardData[row][col] = (row + col) % 2;
      }
    }

    // 定义两种粉色
    const lightPink = 0xFFB6C1; // 浅粉色
    const darkPink = 0xFF69B4;  // 深粉色

    // 创建Graphics对象绘制棋盘格
    const graphics = this.add.graphics();

    // 遍历二维数组绘制方格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = col * this.tileSize + 100; // 起始x偏移100
        const y = row * this.tileSize + 50;  // 起始y偏移50

        // 根据数组值选择颜色
        const color = this.boardData[row][col] === 0 ? lightPink : darkPink;
        
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, this.tileSize, this.tileSize);

        // 绘制边框使格子更清晰
        graphics.lineStyle(2, 0xFFFFFF, 0.3);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);

        this.tilesGenerated++;
      }
    }

    // 添加标题文本
    this.add.text(100, 10, '5x5 Pink Checkerboard', {
      fontSize: '24px',
      color: '#FF69B4',
      fontStyle: 'bold'
    });

    // 显示状态信息
    this.add.text(100, 500, `Tiles Generated: ${this.tilesGenerated}`, {
      fontSize: '18px',
      color: '#333333'
    });

    this.add.text(100, 525, `Board Size: ${this.boardSize}x${this.boardSize}`, {
      fontSize: '18px',
      color: '#333333'
    });

    // 输出状态到控制台供验证
    console.log('Checkerboard Data:', this.boardData);
    console.log('Total Tiles:', this.tilesGenerated);
    console.log('Board Configuration:', {
      size: this.boardSize,
      tileSize: this.tileSize,
      totalTiles: this.tilesGenerated
    });
  }

  update(time, delta) {
    // 棋盘格是静态的，不需要更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#F5F5F5',
  scene: CheckerboardScene
};

// 创建游戏实例
const game = new Phaser.Game(config);