class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.mapWidth = 20;
    this.mapHeight = 20;
    this.tileSize = 32;
    this.totalTiles = 0;
    this.darkTileCount = 0;
    this.lightTileCount = 0;
  }

  preload() {
    // 创建两种橙色纹理
    this.createOrangeTileTextures();
  }

  create() {
    // 创建空白地图
    const map = this.make.tilemap({
      tileWidth: this.tileSize,
      tileHeight: this.tileSize,
      width: this.mapWidth,
      height: this.mapHeight
    });

    // 添加两个瓦片集（使用我们创建的纹理）
    const darkTileset = map.addTilesetImage('darkOrange');
    const lightTileset = map.addTilesetImage('lightOrange');

    // 创建图层
    const layer = map.createBlankLayer('checkerboard', [darkTileset, lightTileset]);

    // 生成棋盘格图案
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        // 根据坐标奇偶性选择瓦片索引
        // 索引 0 对应深橙色，索引 1 对应浅橙色
        const tileIndex = (x + y) % 2 === 0 ? 0 : 1;
        layer.putTileAt(tileIndex, x, y);
        
        // 更新统计
        this.totalTiles++;
        if (tileIndex === 0) {
          this.darkTileCount++;
        } else {
          this.lightTileCount++;
        }
      }
    }

    // 将地图居中显示
    layer.setPosition(
      (this.cameras.main.width - this.mapWidth * this.tileSize) / 2,
      (this.cameras.main.height - this.mapHeight * this.tileSize) / 2
    );

    // 添加文本显示状态信息
    this.add.text(10, 10, 'Orange Checkerboard Map', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    console.log('Map generated successfully!');
    console.log(`Total tiles: ${this.totalTiles}`);
    console.log(`Dark orange tiles: ${this.darkTileCount}`);
    console.log(`Light orange tiles: ${this.lightTileCount}`);
  }

  createOrangeTileTextures() {
    // 创建深橙色瓦片纹理
    const darkGraphics = this.add.graphics();
    darkGraphics.fillStyle(0xFF8C00, 1); // 深橙色
    darkGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    darkGraphics.lineStyle(1, 0xCC7000, 1);
    darkGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    darkGraphics.generateTexture('darkOrange', this.tileSize, this.tileSize);
    darkGraphics.destroy();

    // 创建浅橙色瓦片纹理
    const lightGraphics = this.add.graphics();
    lightGraphics.fillStyle(0xFFA500, 1); // 浅橙色
    lightGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    lightGraphics.lineStyle(1, 0xDD9400, 1);
    lightGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    lightGraphics.generateTexture('lightOrange', this.tileSize, this.tileSize);
    lightGraphics.destroy();
  }

  updateStatusText() {
    const statusInfo = [
      `Map Size: ${this.mapWidth}x${this.mapHeight}`,
      `Total Tiles: ${this.totalTiles}`,
      `Dark Orange: ${this.darkTileCount}`,
      `Light Orange: ${this.lightTileCount}`
    ].join('\n');
    
    this.statusText.setText(statusInfo);
  }

  update(time, delta) {
    // 游戏循环更新（当前无需特殊更新逻辑）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  pixelArt: true // 保持瓦片清晰
};

new Phaser.Game(config);