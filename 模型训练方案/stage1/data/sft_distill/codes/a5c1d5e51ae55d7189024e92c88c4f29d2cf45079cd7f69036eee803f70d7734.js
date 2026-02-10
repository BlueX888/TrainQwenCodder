class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.mapGenerated = false;
    this.tilesPlaced = 0;
    this.totalTiles = 400; // 20x20
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const tileSize = 32;
    const mapWidth = 20;
    const mapHeight = 20;

    // 创建两种橙色纹理
    this.createOrangeTileTextures(tileSize);

    // 创建空白 Tilemap
    const map = this.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: mapWidth,
      height: mapHeight
    });

    // 添加 tileset（使用我们创建的纹理）
    const tileset1 = map.addTilesetImage('orangeTile1', null, tileSize, tileSize);
    const tileset2 = map.addTilesetImage('orangeTile2', null, tileSize, tileSize);

    // 创建图层
    const layer = map.createBlankLayer('checkerboard', [tileset1, tileset2], 0, 0);

    // 生成棋盘格数据
    const checkerboardData = this.generateCheckerboardData(mapWidth, mapHeight);

    // 填充瓦片
    this.tilesPlaced = 0;
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileIndex = checkerboardData[y][x];
        layer.putTileAt(tileIndex, x, y);
        this.tilesPlaced++;
      }
    }

    // 居中显示地图
    const centerX = (this.cameras.main.width - mapWidth * tileSize) / 2;
    const centerY = (this.cameras.main.height - mapHeight * tileSize) / 2;
    layer.setPosition(centerX, centerY);

    // 设置状态信号
    this.mapGenerated = true;

    // 添加状态显示文本
    this.add.text(10, 10, `Map Generated: ${this.mapGenerated}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.add.text(10, 40, `Tiles Placed: ${this.tilesPlaced}/${this.totalTiles}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log('Checkerboard map generated successfully!');
    console.log('Map status:', {
      generated: this.mapGenerated,
      tilesPlaced: this.tilesPlaced,
      totalTiles: this.totalTiles
    });
  }

  /**
   * 创建两种橙色系瓦片纹理
   */
  createOrangeTileTextures(size) {
    // 深橙色瓦片
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0xFF8C00, 1); // 深橙色
    graphics1.fillRect(0, 0, size, size);
    graphics1.lineStyle(2, 0xCC6600, 1);
    graphics1.strokeRect(0, 0, size, size);
    graphics1.generateTexture('orangeTile1', size, size);
    graphics1.destroy();

    // 浅橙色瓦片
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xFFB347, 1); // 浅橙色
    graphics2.fillRect(0, 0, size, size);
    graphics2.lineStyle(2, 0xFF9933, 1);
    graphics2.strokeRect(0, 0, size, size);
    graphics2.generateTexture('orangeTile2', size, size);
    graphics2.destroy();
  }

  /**
   * 生成棋盘格二维数组数据
   * @param {number} width - 地图宽度
   * @param {number} height - 地图高度
   * @returns {number[][]} 二维数组
   */
  generateCheckerboardData(width, height) {
    const data = [];
    
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        // 棋盘格模式：(x + y) % 2 决定使用哪种颜色
        // 0 使用第一种橙色，1 使用第二种橙色
        const tileIndex = (x + y) % 2;
        row.push(tileIndex);
      }
      data.push(row);
    }
    
    return data;
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 700,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  pixelArt: true // 保持像素清晰
};

// 启动游戏
new Phaser.Game(config);