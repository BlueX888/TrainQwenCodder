class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.boardSize = 12;
    this.tileSize = 50;
    this.totalTiles = 0;
    this.pinkTiles = 0;
    this.lightPinkTiles = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建12x12的二维数组
    const boardData = [];
    for (let i = 0; i < this.boardSize; i++) {
      boardData[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        // 0表示深粉色，1表示浅粉色
        boardData[i][j] = (i + j) % 2;
      }
    }

    // 定义两种粉色
    const darkPink = 0xFF69B4;   // 深粉色
    const lightPink = 0FFB6C1;  // 浅粉色

    // 创建Graphics对象生成纹理
    const graphics = this.add.graphics();

    // 生成深粉色纹理
    graphics.fillStyle(darkPink, 1);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('darkPinkTile', this.tileSize, this.tileSize);
    graphics.clear();

    // 生成浅粉色纹理
    graphics.fillStyle(lightPink, 1);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('lightPinkTile', this.tileSize, this.tileSize);
    graphics.destroy();

    // 计算居中偏移量
    const offsetX = (this.cameras.main.width - this.boardSize * this.tileSize) / 2;
    const offsetY = (this.cameras.main.height - this.boardSize * this.tileSize) / 2;

    // 遍历二维数组，绘制棋盘格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        
        // 根据数组值选择纹理
        const texture = boardData[row][col] === 0 ? 'darkPinkTile' : 'lightPinkTile';
        
        // 创建图像对象
        const tile = this.add.image(x, y, texture);
        tile.setOrigin(0, 0);
        
        // 更新状态统计
        this.totalTiles++;
        if (boardData[row][col] === 0) {
          this.pinkTiles++;
        } else {
          this.lightPinkTiles++;
        }
      }
    }

    // 添加文本显示状态信息
    const statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    statusText.setText([
      `棋盘大小: ${this.boardSize}x${this.boardSize}`,
      `总方块数: ${this.totalTiles}`,
      `深粉色方块: ${this.pinkTiles}`,
      `浅粉色方块: ${this.lightPinkTiles}`
    ]);

    // 在控制台输出验证信息
    console.log('棋盘生成完成！');
    console.log('二维数组数据:', boardData);
    console.log('状态统计:', {
      totalTiles: this.totalTiles,
      pinkTiles: this.pinkTiles,
      lightPinkTiles: this.lightPinkTiles
    });
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

// 创建游戏实例
new Phaser.Game(config);