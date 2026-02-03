const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

// 全局验证信号
window.__signals__ = {
  boardSize: 8,
  tileCount: 0,
  lightTileCount: 0,
  darkTileCount: 0,
  tileSize: 64,
  completed: false
};

function preload() {
  // 使用 Graphics 创建两种粉色纹理
  createPinkTextures.call(this);
}

function create() {
  const BOARD_SIZE = 8;
  const TILE_SIZE = 64;
  
  // 创建 Tilemap
  const map = this.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: BOARD_SIZE,
    height: BOARD_SIZE
  });
  
  // 添加两种粉色瓦片集
  const lightPinkTileset = map.addTilesetImage('lightPink', 'lightPink', TILE_SIZE, TILE_SIZE);
  const darkPinkTileset = map.addTilesetImage('darkPink', 'darkPink', TILE_SIZE, TILE_SIZE);
  
  // 创建空白图层
  const layer = map.createBlankLayer('checkerboard', [lightPinkTileset, darkPinkTileset]);
  
  // 生成 8x8 棋盘格
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // 根据行列索引的奇偶性决定颜色
      const isLightTile = (row + col) % 2 === 0;
      
      if (isLightTile) {
        // 放置浅粉色瓦片（索引 0）
        layer.putTileAt(0, col, row);
        window.__signals__.lightTileCount++;
      } else {
        // 放置深粉色瓦片（索引 1）
        layer.putTileAt(1, col, row);
        window.__signals__.darkTileCount++;
      }
      
      window.__signals__.tileCount++;
    }
  }
  
  // 居中显示棋盘
  const boardWidth = BOARD_SIZE * TILE_SIZE;
  const boardHeight = BOARD_SIZE * TILE_SIZE;
  layer.setPosition(
    (config.width - boardWidth) / 2,
    (config.height - boardHeight) / 2
  );
  
  // 添加标题文本
  this.add.text(config.width / 2, 30, 'Pink Checkerboard 8x8', {
    fontSize: '32px',
    fill: '#ff69b4',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 添加信息文本
  this.add.text(config.width / 2, config.height - 30, 
    `Light Pink: ${window.__signals__.lightTileCount} | Dark Pink: ${window.__signals__.darkTileCount}`, {
    fontSize: '20px',
    fill: '#ffffff'
  }).setOrigin(0.5);
  
  // 标记完成
  window.__signals__.completed = true;
  
  // 输出验证日志
  console.log(JSON.stringify({
    type: 'checkerboard_created',
    boardSize: window.__signals__.boardSize,
    totalTiles: window.__signals__.tileCount,
    lightTiles: window.__signals__.lightTileCount,
    darkTiles: window.__signals__.darkTileCount,
    tileSize: window.__signals__.tileSize,
    timestamp: Date.now()
  }));
}

function createPinkTextures() {
  // 创建浅粉色纹理
  const lightGraphics = this.add.graphics();
  lightGraphics.fillStyle(0xFFB6C1, 1); // Light Pink
  lightGraphics.fillRect(0, 0, 64, 64);
  lightGraphics.generateTexture('lightPink', 64, 64);
  lightGraphics.destroy();
  
  // 创建深粉色纹理
  const darkGraphics = this.add.graphics();
  darkGraphics.fillStyle(0xFF69B4, 1); // Hot Pink
  darkGraphics.fillRect(0, 0, 64, 64);
  darkGraphics.generateTexture('darkPink', 64, 64);
  darkGraphics.destroy();
}

new Phaser.Game(config);