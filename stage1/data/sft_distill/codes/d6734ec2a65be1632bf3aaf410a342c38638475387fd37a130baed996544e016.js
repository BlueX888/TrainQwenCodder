class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.tilesRendered = 0;
    this.totalTiles = 64;
    this.isComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const tileSize = 60;
    const boardSize = 8;
    const startX = 100;
    const startY = 50;

    // 定义两种橙色
    const darkOrange = 0xFF8C00;  // 深橙色
    const lightOrange = 0xFFB366; // 浅橙色

    // 创建Graphics对象生成纹理
    const graphics = this.add.graphics();

    // 生成深橙色纹理
    graphics.fillStyle(darkOrange, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('darkOrangeTile', tileSize, tileSize);
    graphics.clear();

    // 生成浅橙色纹理
    graphics.fillStyle(lightOrange, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('lightOrangeTile', tileSize, tileSize);
    graphics.destroy();

    // 定义8x8二维数组（0和1交替）
    const boardData = [];
    for (let row = 0; row < boardSize; row++) {
      boardData[row] = [];
      for (let col = 0; col < boardSize; col++) {
        // 棋盘格模式：行列索引之和为偶数用0，奇数用1
        boardData[row][col] = (row + col) % 2;
      }
    }

    // 根据二维数组渲染棋盘格
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const x = startX + col * tileSize;
        const y = startY + row * tileSize;
        
        // 根据数组值选择纹理
        const texture = boardData[row][col] === 0 ? 'darkOrangeTile' : 'lightOrangeTile';
        
        const tile = this.add.image(x, y, texture);
        tile.setOrigin(0, 0);
        
        this.tilesRendered++;
      }
    }

    // 标记完成状态
    this.isComplete = true;

    // 添加标题文本
    this.add.text(startX, startY - 30, 'Orange Checkerboard 8x8', {
      fontSize: '24px',
      color: '#FF8C00',
      fontStyle: 'bold'
    });

    // 添加状态信息
    this.add.text(startX, startY + boardSize * tileSize + 10, 
      `Tiles Rendered: ${this.tilesRendered}/${this.totalTiles}`, {
      fontSize: '18px',
      color: '#333333'
    });

    // 添加网格线（可选，让棋盘格更清晰）
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x000000, 0.3);
    
    // 绘制垂直线
    for (let i = 0; i <= boardSize; i++) {
      gridGraphics.lineBetween(
        startX + i * tileSize, 
        startY,
        startX + i * tileSize, 
        startY + boardSize * tileSize
      );
    }
    
    // 绘制水平线
    for (let i = 0; i <= boardSize; i++) {
      gridGraphics.lineBetween(
        startX, 
        startY + i * tileSize,
        startX + boardSize * tileSize, 
        startY + i * tileSize
      );
    }

    // 输出状态到控制台
    console.log('Checkerboard Status:', {
      tilesRendered: this.tilesRendered,
      totalTiles: this.totalTiles,
      isComplete: this.isComplete,
      boardData: boardData
    });
  }

  update(time, delta) {
    // 棋盘格是静态的，无需更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#f0f0f0',
  scene: CheckerboardScene
};

new Phaser.Game(config);