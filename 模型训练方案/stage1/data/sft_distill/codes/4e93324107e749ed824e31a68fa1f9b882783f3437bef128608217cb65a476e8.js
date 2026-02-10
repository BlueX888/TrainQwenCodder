class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.mapGenerated = false;
    this.tileCount = 0;
  }

  preload() {
    // 预加载阶段，准备生成纹理
  }

  create() {
    const tileSize = 80;
    const mapWidth = 3;
    const mapHeight = 3;

    // 1. 使用 Graphics 生成两种红色纹理
    const graphics = this.add.graphics();

    // 深红色瓦片
    graphics.fillStyle(0xCC0000, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('tile_dark_red', tileSize, tileSize);
    graphics.clear();

    // 浅红色瓦片
    graphics.fillStyle(0xFF6666, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('tile_light_red', tileSize, tileSize);
    graphics.clear();

    graphics.destroy();

    // 2. 创建 3x3 棋盘格数据（0=深红，1=浅红）
    const mapData = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0]
    ];

    // 3. 创建空白 Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: tileSize,
      tileHeight: tileSize
    });

    // 4. 添加瓦片集（将生成的纹理添加到地图）
    const tiles = map.addTilesetImage('tile_dark_red', null, tileSize, tileSize);
    
    // 注意：Phaser 的 Tilemap 使用单一 tileset，所以我们需要手动处理
    // 创建图层
    const layer = map.createLayer(0, tiles, 100, 100);

    // 5. 手动设置每个瓦片的纹理（因为我们有两种颜色）
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tile = layer.getTileAt(x, y);
        if (tile) {
          // 根据数据值设置不同的着色
          if (mapData[y][x] === 0) {
            tile.tint = 0xCC0000; // 深红
          } else {
            tile.tint = 0xFF6666; // 浅红
          }
          this.tileCount++;
        }
      }
    }

    // 6. 添加边框以便更清晰地看到棋盘格
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0x000000, 1);
    for (let y = 0; y <= mapHeight; y++) {
      borderGraphics.lineBetween(
        100, 
        100 + y * tileSize, 
        100 + mapWidth * tileSize, 
        100 + y * tileSize
      );
    }
    for (let x = 0; x <= mapWidth; x++) {
      borderGraphics.lineBetween(
        100 + x * tileSize, 
        100, 
        100 + x * tileSize, 
        100 + mapHeight * tileSize
      );
    }

    // 7. 添加文本显示状态信息
    this.add.text(100, 20, `Checkerboard Map Generated`, {
      fontSize: '20px',
      color: '#ffffff'
    });

    this.add.text(100, 50, `Tiles: ${this.tileCount} | Size: ${mapWidth}x${mapHeight}`, {
      fontSize: '16px',
      color: '#cccccc'
    });

    // 8. 设置状态变量
    this.mapGenerated = true;

    console.log('Checkerboard map created successfully');
    console.log('Map data:', mapData);
    console.log('Total tiles:', this.tileCount);
  }

  update(time, delta) {
    // 每帧更新逻辑（本例中不需要）
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 500,
  height: 500,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

// 启动游戏
new Phaser.Game(config);