class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.tilesRendered = 0; // 状态信号：已渲染的棋盘格数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义3x3二维数组表示棋盘
    const boardData = [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ];

    // 棋盘格尺寸
    const tileSize = 100;
    const startX = 150;
    const startY = 100;

    // 创建两种绿色纹理
    this.createGreenTextures(tileSize);

    // 遍历二维数组生成棋盘格
    for (let row = 0; row < boardData.length; row++) {
      for (let col = 0; col < boardData[row].length; col++) {
        if (boardData[row][col] === 1) {
          const x = startX + col * tileSize;
          const y = startY + row * tileSize;
          
          // 根据行列索引和决定颜色（棋盘格交替效果）
          const isLightGreen = (row + col) % 2 === 0;
          const textureName = isLightGreen ? 'lightGreen' : 'darkGreen';
          
          // 创建矩形方块
          const tile = this.add.rectangle(x, y, tileSize, tileSize);
          tile.setTexture(textureName);
          tile.setOrigin(0, 0);
          
          this.tilesRendered++;
        }
      }
    }

    // 添加文本显示状态
    this.add.text(150, 50, `Tiles Rendered: ${this.tilesRendered}`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 添加标题
    this.add.text(250, 20, '3x3 Checkerboard', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 在控制台输出验证信息
    console.log('Checkerboard created with', this.tilesRendered, 'tiles');
  }

  createGreenTextures(size) {
    // 创建浅绿色纹理
    const lightGraphics = this.add.graphics();
    lightGraphics.fillStyle(0x90EE90, 1); // 浅绿色
    lightGraphics.fillRect(0, 0, size, size);
    lightGraphics.generateTexture('lightGreen', size, size);
    lightGraphics.destroy();

    // 创建深绿色纹理
    const darkGraphics = this.add.graphics();
    darkGraphics.fillStyle(0x228B22, 1); // 深绿色
    darkGraphics.fillRect(0, 0, size, size);
    darkGraphics.generateTexture('darkGreen', size, size);
    darkGraphics.destroy();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

new Phaser.Game(config);