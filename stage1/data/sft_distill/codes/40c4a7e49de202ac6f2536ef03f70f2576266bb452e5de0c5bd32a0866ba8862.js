class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态验证变量
    this.mapWidth = 3;
    this.mapHeight = 3;
    this.tileSize = 64;
    this.tilesPlaced = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 使用 Graphics 生成两种红色系纹理
    this.createTileTextures();

    // 2. 定义 3x3 棋盘格数据（交替 0 和 1）
    const mapData = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ];

    // 3. 创建 Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize
    });

    // 4. 添加图块集，关联生成的纹理
    // addTilesetImage 参数: (tilesetName, textureKey, tileWidth, tileHeight)
    const tiles = map.addTilesetImage('tiles', 'redTiles', this.tileSize, this.tileSize);

    // 5. 创建图层
    const layer = map.createLayer(0, tiles, 100, 100);

    // 统计已放置的图块数量
    this.tilesPlaced = this.mapWidth * this.mapHeight;

    // 添加调试信息文本
    this.add.text(10, 10, `Map Size: ${this.mapWidth}x${this.mapHeight}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 40, `Tiles Placed: ${this.tilesPlaced}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.add.text(10, 70, `Tile Size: ${this.tileSize}px`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边框提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRect(
      100 - 2,
      100 - 2,
      this.mapWidth * this.tileSize + 4,
      this.mapHeight * this.tileSize + 4
    );

    console.log('Tilemap created successfully!');
    console.log('Map dimensions:', this.mapWidth, 'x', this.mapHeight);
    console.log('Total tiles:', this.tilesPlaced);
  }

  createTileTextures() {
    // 创建包含两种红色的纹理图集
    const canvas = this.textures.createCanvas('redTiles', this.tileSize * 2, this.tileSize);
    const ctx = canvas.getContext();

    // 第一种颜色：深红色 (索引 0)
    ctx.fillStyle = '#8B0000'; // 深红
    ctx.fillRect(0, 0, this.tileSize, this.tileSize);

    // 添加一些细节使其更明显
    ctx.fillStyle = '#A52A2A';
    ctx.fillRect(4, 4, this.tileSize - 8, this.tileSize - 8);

    // 第二种颜色：浅红色 (索引 1)
    ctx.fillStyle = '#DC143C'; // 猩红
    ctx.fillRect(this.tileSize, 0, this.tileSize, this.tileSize);

    // 添加一些细节使其更明显
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(this.tileSize + 4, 4, this.tileSize - 8, this.tileSize - 8);

    // 刷新纹理
    canvas.refresh();
  }

  update(time, delta) {
    // 每帧更新逻辑（本示例不需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  pixelArt: true // 使图块边缘更清晰
};

// 创建游戏实例
new Phaser.Game(config);