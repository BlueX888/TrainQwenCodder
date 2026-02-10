class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.boardSize = 15;
    this.tileSize = 40;
    this.totalTiles = 0;
    this.renderedTiles = 0;
    this.boardData = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化15x15二维数组
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 根据行列奇偶性决定颜色类型（0或1）
        this.boardData[row][col] = (row + col) % 2;
        this.totalTiles++;
      }
    }

    // 创建两种粉色纹理
    this.createPinkTextures();

    // 渲染棋盘格
    this.renderCheckerboard();

    // 添加信息文本显示状态
    this.add.text(10, 10, `Board Size: ${this.boardSize}x${this.boardSize}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.add.text(10, 40, `Total Tiles: ${this.totalTiles}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.add.text(10, 70, `Rendered Tiles: ${this.renderedTiles}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 添加点击事件，显示点击的格子坐标
    this.input.on('pointerdown', (pointer) => {
      const col = Math.floor((pointer.x - 50) / this.tileSize);
      const row = Math.floor((pointer.y - 120) / this.tileSize);
      
      if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize) {
        console.log(`Clicked tile at [${row}, ${col}], value: ${this.boardData[row][col]}`);
      }
    });
  }

  createPinkTextures() {
    // 创建浅粉色纹理
    const lightPinkGraphics = this.add.graphics();
    lightPinkGraphics.fillStyle(0xFFB6C1, 1); // 浅粉色
    lightPinkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    lightPinkGraphics.generateTexture('lightPink', this.tileSize, this.tileSize);
    lightPinkGraphics.destroy();

    // 创建深粉色纹理
    const darkPinkGraphics = this.add.graphics();
    darkPinkGraphics.fillStyle(0xFF69B4, 1); // 深粉色
    darkPinkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    darkPinkGraphics.generateTexture('darkPink', this.tileSize, this.tileSize);
    darkPinkGraphics.destroy();
  }

  renderCheckerboard() {
    // 计算棋盘起始位置（居中显示，留出顶部空间给状态文本）
    const startX = 50;
    const startY = 120;

    // 遍历二维数组绘制棋盘格
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const x = startX + col * this.tileSize;
        const y = startY + row * this.tileSize;
        
        // 根据数组值选择纹理
        const textureName = this.boardData[row][col] === 0 ? 'lightPink' : 'darkPink';
        
        // 创建图像对象
        const tile = this.add.image(x, y, textureName);
        tile.setOrigin(0, 0);
        
        // 添加边框效果
        const border = this.add.graphics();
        border.lineStyle(1, 0xFFFFFF, 0.3);
        border.strokeRect(x, y, this.tileSize, this.tileSize);
        
        this.renderedTiles++;
      }
    }

    console.log(`Checkerboard rendered: ${this.renderedTiles} tiles`);
  }

  update(time, delta) {
    // 可选：添加动画或交互逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

new Phaser.Game(config);