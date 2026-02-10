class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.boardSize = 12;
    this.tileSize = 50;
    this.tilesRendered = 0;
    this.totalTiles = this.boardSize * this.boardSize;
    this.boardData = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化12x12二维数组
    for (let i = 0; i < this.boardSize; i++) {
      this.boardData[i] = [];
      for (let j = 0; j < this.boardSize; j++) {
        // 根据位置确定颜色类型 (0=浅灰, 1=深灰)
        this.boardData[i][j] = (i + j) % 2;
      }
    }

    // 创建两种灰色纹理
    this.createTileTextures();

    // 渲染棋盘
    this.renderCheckerboard();

    // 添加文本显示状态信息
    this.add.text(10, 10, `Board Size: ${this.boardSize}x${this.boardSize}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 40, `Total Tiles: ${this.totalTiles}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 70, `Tiles Rendered: ${this.tilesRendered}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加网格线以更清晰地显示棋盘
    this.drawGridLines();

    console.log('Checkerboard created successfully!');
    console.log('Board data:', this.boardData);
    console.log('Tiles rendered:', this.tilesRendered);
  }

  createTileTextures() {
    // 创建浅灰色纹理
    const lightGray = this.add.graphics();
    lightGray.fillStyle(0xcccccc, 1);
    lightGray.fillRect(0, 0, this.tileSize, this.tileSize);
    lightGray.generateTexture('lightTile', this.tileSize, this.tileSize);
    lightGray.destroy();

    // 创建深灰色纹理
    const darkGray = this.add.graphics();
    darkGray.fillStyle(0x666666, 1);
    darkGray.fillRect(0, 0, this.tileSize, this.tileSize);
    darkGray.generateTexture('darkTile', this.tileSize, this.tileSize);
    darkGray.destroy();
  }

  renderCheckerboard() {
    // 计算起始位置使棋盘居中
    const startX = (this.cameras.main.width - this.boardSize * this.tileSize) / 2;
    const startY = (this.cameras.main.height - this.boardSize * this.tileSize) / 2 + 50;

    // 遍历二维数组渲染棋盘
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        const x = startX + j * this.tileSize;
        const y = startY + i * this.tileSize;
        
        // 根据数组值选择纹理
        const textureName = this.boardData[i][j] === 0 ? 'lightTile' : 'darkTile';
        
        // 创建图像对象
        const tile = this.add.image(x, y, textureName);
        tile.setOrigin(0, 0);
        
        // 添加数据属性便于调试
        tile.setData('row', i);
        tile.setData('col', j);
        tile.setData('colorType', this.boardData[i][j]);
        
        this.tilesRendered++;
      }
    }
  }

  drawGridLines() {
    const startX = (this.cameras.main.width - this.boardSize * this.tileSize) / 2;
    const startY = (this.cameras.main.height - this.boardSize * this.tileSize) / 2 + 50;
    
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.5);

    // 绘制垂直线
    for (let i = 0; i <= this.boardSize; i++) {
      const x = startX + i * this.tileSize;
      graphics.lineBetween(
        x, 
        startY, 
        x, 
        startY + this.boardSize * this.tileSize
      );
    }

    // 绘制水平线
    for (let i = 0; i <= this.boardSize; i++) {
      const y = startY + i * this.tileSize;
      graphics.lineBetween(
        startX, 
        y, 
        startX + this.boardSize * this.tileSize, 
        y
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

const game = new Phaser.Game(config);