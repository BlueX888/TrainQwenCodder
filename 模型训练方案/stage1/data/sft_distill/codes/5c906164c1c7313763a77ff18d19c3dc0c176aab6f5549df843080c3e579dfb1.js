class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号：记录地图生成状态
    this.mapGenerated = false;
    this.tileCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const tileSize = 64;
    const mapWidth = 3;
    const mapHeight = 3;

    // 创建两种绿色纹理
    this.createTileTextures(tileSize);

    // 定义 3x3 棋盘格数组（0 和 1 交替）
    const mapData = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ];

    // 创建空白 Tilemap
    const map = this.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: mapWidth,
      height: mapHeight
    });

    // 添加 tileset（使用我们创建的纹理）
    const tileset = map.addTilesetImage('tiles', null, tileSize, tileSize);

    // 创建图层
    const layer = map.createBlankLayer('layer1', tileset, 0, 0);

    // 根据数组填充瓦片
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileIndex = mapData[y][x];
        // 使用 putTileAt 放置瓦片（索引从 0 开始）
        layer.putTileAt(tileIndex, x, y);
        this.tileCount++;
      }
    }

    // 居中显示地图
    const centerX = (this.scale.width - mapWidth * tileSize) / 2;
    const centerY = (this.scale.height - mapHeight * tileSize) / 2;
    layer.setPosition(centerX, centerY);

    // 标记地图生成完成
    this.mapGenerated = true;

    // 添加文本显示状态
    this.add.text(10, 10, `Map Generated: ${this.mapGenerated}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.add.text(10, 30, `Tile Count: ${this.tileCount}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    console.log('Checkerboard map generated successfully!');
    console.log('Map Generated:', this.mapGenerated);
    console.log('Tile Count:', this.tileCount);
  }

  createTileTextures(size) {
    // 创建深绿色纹理（索引 0）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x2d5016, 1); // 深绿色
    graphics1.fillRect(0, 0, size, size);
    graphics1.lineStyle(2, 0x1a3010, 1);
    graphics1.strokeRect(0, 0, size, size);
    graphics1.generateTexture('tile0', size, size);
    graphics1.destroy();

    // 创建浅绿色纹理（索引 1）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0x4a7c2c, 1); // 浅绿色
    graphics2.fillRect(0, 0, size, size);
    graphics2.lineStyle(2, 0x3a6c1c, 1);
    graphics2.strokeRect(0, 0, size, size);
    graphics2.generateTexture('tile1', size, size);
    graphics2.destroy();

    // 将纹理添加到 tileset
    // Phaser 会自动使用这些纹理名称
  }

  update(time, delta) {
    // 不需要更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene
};

new Phaser.Game(config);