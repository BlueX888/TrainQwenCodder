class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.boardSize = 15;
    this.tileSize = 40;
    this.boardData = [];
    this.tilesGenerated = 0; // 状态信号：已生成的格子数
    this.isComplete = false; // 状态信号：是否完成生成
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化二维数组
    this.initBoardData();
    
    // 创建棋盘格纹理
    this.createTileTextures();
    
    // 渲染棋盘格
    this.renderCheckerboard();
    
    // 添加标题文本
    const titleText = this.add.text(
      400, 
      20, 
      'Pink Checkerboard 15x15', 
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ff1493',
        fontStyle: 'bold'
      }
    );
    titleText.setOrigin(0.5, 0);
    
    // 显示状态信息
    this.statusText = this.add.text(
      400,
      660,
      `Tiles: ${this.tilesGenerated} | Complete: ${this.isComplete}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#333333'
      }
    );
    this.statusText.setOrigin(0.5, 0);
    
    // 添加鼠标悬停效果
    this.addInteraction();
  }

  /**
   * 初始化15x15的二维数组
   */
  initBoardData() {
    for (let row = 0; row < this.boardSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        // 根据行列索引奇偶性决定颜色类型（0或1）
        const colorType = (row + col) % 2;
        this.boardData[row][col] = {
          row: row,
          col: col,
          colorType: colorType,
          isHovered: false
        };
      }
    }
  }

  /**
   * 创建两种粉色纹理
   */
  createTileTextures() {
    // 深粉色 (HotPink)
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0xff69b4, 1);
    graphics1.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics1.lineStyle(1, 0xffffff, 0.3);
    graphics1.strokeRect(0, 0, this.tileSize, this.tileSize);
    graphics1.generateTexture('pinkTile1', this.tileSize, this.tileSize);
    graphics1.destroy();

    // 浅粉色 (LightPink)
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xffb6c1, 1);
    graphics2.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics2.lineStyle(1, 0xffffff, 0.3);
    graphics2.strokeRect(0, 0, this.tileSize, this.tileSize);
    graphics2.generateTexture('pinkTile2', this.tileSize, this.tileSize);
    graphics2.destroy();
  }

  /**
   * 渲染棋盘格
   */
  renderCheckerboard() {
    const startX = (800 - this.boardSize * this.tileSize) / 2;
    const startY = 60;

    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const cellData = this.boardData[row][col];
        const x = startX + col * this.tileSize;
        const y = startY + row * this.tileSize;

        // 根据颜色类型选择纹理
        const textureName = cellData.colorType === 0 ? 'pinkTile1' : 'pinkTile2';
        
        // 创建图像对象
        const tile = this.add.image(x, y, textureName);
        tile.setOrigin(0, 0);
        tile.setInteractive();
        
        // 存储引用以便后续交互
        cellData.sprite = tile;
        
        // 增加已生成计数
        this.tilesGenerated++;
      }
    }

    // 标记完成
    this.isComplete = true;
    this.updateStatusText();
  }

  /**
   * 添加交互效果
   */
  addInteraction() {
    this.input.on('gameobjectover', (pointer, gameObject) => {
      // 鼠标悬停时改变透明度
      gameObject.setAlpha(0.7);
    });

    this.input.on('gameobjectout', (pointer, gameObject) => {
      // 鼠标移出时恢复透明度
      gameObject.setAlpha(1.0);
    });

    this.input.on('gameobjectdown', (pointer, gameObject) => {
      // 点击时闪烁效果
      this.tweens.add({
        targets: gameObject,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 1
      });
    });
  }

  /**
   * 更新状态文本
   */
  updateStatusText() {
    if (this.statusText) {
      this.statusText.setText(
        `Tiles: ${this.tilesGenerated} | Complete: ${this.isComplete}`
      );
    }
  }

  update(time, delta) {
    // 可以在这里添加动画或其他更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#f5f5f5',
  scene: CheckerboardScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);