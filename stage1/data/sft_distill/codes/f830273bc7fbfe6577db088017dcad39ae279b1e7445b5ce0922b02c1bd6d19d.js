class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.gridSize = 8;
    this.tileSize = 64;
    this.lightTileCount = 0;
    this.darkTileCount = 0;
    this.totalTiles = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建 8x8 二维数组，棋盘格模式（0 和 1 交替）
    this.boardData = [];
    for (let row = 0; row < this.gridSize; row++) {
      this.boardData[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 棋盘格规则：(row + col) 为偶数时为 0，奇数时为 1
        this.boardData[row][col] = (row + col) % 2;
      }
    }

    // 使用 Graphics 生成两种橙色纹理
    this.createTileTextures();

    // 绘制棋盘
    this.drawCheckerboard();

    // 添加信息文本显示状态
    this.add.text(10, 10, 'Checkerboard Map (8x8)', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(10, 50, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加点击事件，点击方块可切换颜色
    this.input.on('pointerdown', (pointer) => {
      this.handleTileClick(pointer);
    });
  }

  createTileTextures() {
    const graphics = this.add.graphics();

    // 创建浅橙色纹理 (Light Orange)
    graphics.fillStyle(0xFFB366, 1); // 浅橙色
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('lightOrangeTile', this.tileSize, this.tileSize);
    graphics.clear();

    // 创建深橙色纹理 (Dark Orange)
    graphics.fillStyle(0xFF8C00, 1); // 深橙色
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('darkOrangeTile', this.tileSize, this.tileSize);
    graphics.clear();

    // 添加边框效果使棋盘格更清晰
    graphics.lineStyle(2, 0x000000, 0.3);
    graphics.strokeRect(1, 1, this.tileSize - 2, this.tileSize - 2);
    graphics.generateTexture('tileBorder', this.tileSize, this.tileSize);

    graphics.destroy();
  }

  drawCheckerboard() {
    // 创建容器存放所有方块
    this.tilesContainer = this.add.container(100, 100);
    this.tiles = [];

    // 遍历二维数组绘制棋盘
    for (let row = 0; row < this.gridSize; row++) {
      this.tiles[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const tileValue = this.boardData[row][col];
        const x = col * this.tileSize;
        const y = row * this.tileSize;

        // 根据值选择纹理
        const textureName = tileValue === 0 ? 'lightOrangeTile' : 'darkOrangeTile';
        const tile = this.add.image(x, y, textureName);
        tile.setOrigin(0, 0);
        tile.setInteractive();
        
        // 存储方块信息
        tile.setData('row', row);
        tile.setData('col', col);
        tile.setData('value', tileValue);

        this.tilesContainer.add(tile);
        this.tiles[row][col] = tile;

        // 统计数量
        if (tileValue === 0) {
          this.lightTileCount++;
        } else {
          this.darkTileCount++;
        }
        this.totalTiles++;
      }
    }

    // 添加边框
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(4, 0x000000, 1);
    borderGraphics.strokeRect(
      98, 
      98, 
      this.gridSize * this.tileSize + 4, 
      this.gridSize * this.tileSize + 4
    );
  }

  handleTileClick(pointer) {
    // 将点击坐标转换为相对于容器的坐标
    const localX = pointer.x - this.tilesContainer.x;
    const localY = pointer.y - this.tilesContainer.y;

    // 计算点击的行列
    const col = Math.floor(localX / this.tileSize);
    const row = Math.floor(localY / this.tileSize);

    // 检查是否在有效范围内
    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
      const tile = this.tiles[row][col];
      const currentValue = tile.getData('value');
      const newValue = 1 - currentValue; // 切换 0 和 1

      // 更新数据和纹理
      this.boardData[row][col] = newValue;
      tile.setData('value', newValue);
      tile.setTexture(newValue === 0 ? 'lightOrangeTile' : 'darkOrangeTile');

      // 更新统计
      if (newValue === 0) {
        this.lightTileCount++;
        this.darkTileCount--;
      } else {
        this.lightTileCount--;
        this.darkTileCount++;
      }

      this.updateStatusText();
    }
  }

  updateStatusText() {
    const text = `Total Tiles: ${this.totalTiles}\n` +
                 `Light Orange: ${this.lightTileCount}\n` +
                 `Dark Orange: ${this.darkTileCount}\n` +
                 `Click tiles to toggle colors`;
    this.statusText.setText(text);
  }

  update(time, delta) {
    // 可选：添加动画效果
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

const game = new Phaser.Game(config);