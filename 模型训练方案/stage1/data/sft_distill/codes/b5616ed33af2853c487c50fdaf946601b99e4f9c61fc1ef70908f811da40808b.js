const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 状态变量
let gameState = {
  totalTiles: 0,
  lightPinkCount: 0,
  darkPinkCount: 0,
  mapSize: 20
};

function preload() {
  // 使用 Graphics 生成两种粉色瓦片纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 浅粉色瓦片 (索引 0)
  graphics.fillStyle(0xFFB6C1, 1); // Light Pink
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('tile_light_pink', 32, 32);
  graphics.clear();
  
  // 深粉色瓦片 (索引 1)
  graphics.fillStyle(0xFF69B4, 1); // Hot Pink
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('tile_dark_pink', 32, 32);
  graphics.destroy();
}

function create() {
  const tileSize = 32;
  const mapWidth = gameState.mapSize;
  const mapHeight = gameState.mapSize;
  
  // 创建空白 Tilemap
  const map = this.make.tilemap({
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: mapWidth,
    height: mapHeight
  });
  
  // 添加两种粉色瓦片到 Tileset
  const tileset = map.addTilesetImage('tiles', null, tileSize, tileSize, 0, 0);
  
  // 手动设置 tileset 的纹理映射
  tileset.setImage(this.textures.get('tile_light_pink'));
  
  // 创建图层
  const layer = map.createBlankLayer('checkerboard', tileset, 0, 0);
  
  // 生成 20x20 的棋盘格地图
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      // 棋盘规则：(x + y) % 2 决定颜色
      const isLightPink = (x + y) % 2 === 0;
      
      if (isLightPink) {
        // 使用浅粉色
        const tile = layer.putTileAt(0, x, y);
        tile.tint = 0xFFB6C1; // Light Pink
        gameState.lightPinkCount++;
      } else {
        // 使用深粉色
        const tile = layer.putTileAt(0, x, y);
        tile.tint = 0xFF69B4; // Hot Pink
        gameState.darkPinkCount++;
      }
      
      gameState.totalTiles++;
    }
  }
  
  // 居中显示地图
  const mapPixelWidth = mapWidth * tileSize;
  const mapPixelHeight = mapHeight * tileSize;
  layer.setPosition(
    (config.width - mapPixelWidth) / 2,
    (config.height - mapPixelHeight) / 2
  );
  
  // 显示状态信息
  const style = {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  };
  
  this.add.text(10, 10, `地图大小: ${gameState.mapSize}x${gameState.mapSize}`, style);
  this.add.text(10, 40, `总瓦片数: ${gameState.totalTiles}`, style);
  this.add.text(10, 70, `浅粉色: ${gameState.lightPinkCount}`, style);
  this.add.text(10, 100, `深粉色: ${gameState.darkPinkCount}`, style);
  
  // 添加标题
  const titleStyle = {
    fontSize: '24px',
    fill: '#FF69B4',
    fontStyle: 'bold',
    stroke: '#ffffff',
    strokeThickness: 2
  };
  this.add.text(config.width / 2, 20, '粉色棋盘格地图', titleStyle).setOrigin(0.5, 0);
  
  // 输出状态到控制台
  console.log('=== 粉色棋盘格地图生成完成 ===');
  console.log(`地图大小: ${gameState.mapSize}x${gameState.mapSize}`);
  console.log(`总瓦片数: ${gameState.totalTiles}`);
  console.log(`浅粉色瓦片: ${gameState.lightPinkCount}`);
  console.log(`深粉色瓦片: ${gameState.darkPinkCount}`);
}

new Phaser.Game(config);