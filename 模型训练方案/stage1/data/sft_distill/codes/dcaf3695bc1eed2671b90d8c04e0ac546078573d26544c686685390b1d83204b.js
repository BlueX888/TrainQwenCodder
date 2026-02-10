const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

// 游戏状态变量
let gameState = {
  totalTiles: 0,
  lightPinkCount: 0,
  darkPinkCount: 0,
  mapSize: 20
};

function preload() {
  // 预加载阶段（本例中纹理在 create 中动态生成）
}

function create() {
  const tileSize = 32;
  const mapSize = 20;
  
  // 创建两种粉色纹理
  createPinkTextures.call(this, tileSize);
  
  // 创建空白 Tilemap
  const map = this.make.tilemap({
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: mapSize,
    height: mapSize
  });
  
  // 添加自定义 Tileset（包含两种粉色瓦片）
  const tileset = map.addTilesetImage('pinkTiles', null, tileSize, tileSize);
  
  // 创建图层
  const layer = map.createBlankLayer('checkerboard', tileset, 0, 0);
  
  // 填充棋盘格数据
  for (let y = 0; y < mapSize; y++) {
    for (let x = 0; x < mapSize; x++) {
      // 棋盘格规则：(x + y) % 2 决定颜色
      const tileIndex = (x + y) % 2 === 0 ? 0 : 1;
      layer.putTileAt(tileIndex, x, y);
      
      // 更新状态
      gameState.totalTiles++;
      if (tileIndex === 0) {
        gameState.lightPinkCount++;
      } else {
        gameState.darkPinkCount++;
      }
    }
  }
  
  // 居中显示地图
  const mapWidth = mapSize * tileSize;
  const mapHeight = mapSize * tileSize;
  layer.setPosition(
    (this.cameras.main.width - mapWidth) / 2,
    (this.cameras.main.height - mapHeight) / 2
  );
  
  // 显示状态信息
  displayGameState.call(this);
  
  console.log('Game State:', gameState);
}

function createPinkTextures(tileSize) {
  // 创建浅粉色纹理（索引 0）
  const lightPinkGraphics = this.add.graphics();
  lightPinkGraphics.fillStyle(0xFFB6C1, 1); // Light Pink
  lightPinkGraphics.fillRect(0, 0, tileSize, tileSize);
  lightPinkGraphics.generateTexture('lightPink', tileSize, tileSize);
  lightPinkGraphics.destroy();
  
  // 创建深粉色纹理（索引 1）
  const darkPinkGraphics = this.add.graphics();
  darkPinkGraphics.fillStyle(0xFF69B4, 1); // Hot Pink
  darkPinkGraphics.fillRect(0, 0, tileSize, tileSize);
  darkPinkGraphics.generateTexture('darkPink', tileSize, tileSize);
  darkPinkGraphics.destroy();
  
  // 将纹理添加到纹理管理器中作为 Tileset 使用
  // Phaser 会自动将生成的纹理用于 Tilemap
  this.textures.addSpriteSheet('pinkTiles', 
    this.textures.get('lightPink').getSourceImage(), 
    { frameWidth: tileSize, frameHeight: tileSize }
  );
}

function displayGameState() {
  const style = {
    font: '16px Arial',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  };
  
  this.add.text(10, 10, `Total Tiles: ${gameState.totalTiles}`, style);
  this.add.text(10, 40, `Light Pink: ${gameState.lightPinkCount}`, style);
  this.add.text(10, 70, `Dark Pink: ${gameState.darkPinkCount}`, style);
  this.add.text(10, 100, `Map Size: ${gameState.mapSize}x${gameState.mapSize}`, style);
}

// 启动游戏
new Phaser.Game(config);