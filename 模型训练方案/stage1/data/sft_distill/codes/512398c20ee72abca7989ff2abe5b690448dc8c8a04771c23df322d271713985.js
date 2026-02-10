const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 状态信号变量
let gameState = {
  mapWidth: 3,
  mapHeight: 3,
  tileSize: 64,
  tilesCreated: 0,
  mapGenerated: false
};

function preload() {
  // 使用 Graphics 创建两种绿色瓦片纹理
  const graphics = this.add.graphics();
  
  // 深绿色瓦片
  graphics.fillStyle(0x228B22, 1); // Forest Green
  graphics.fillRect(0, 0, 64, 64);
  graphics.lineStyle(2, 0x1a6b1a, 1);
  graphics.strokeRect(0, 0, 64, 64);
  graphics.generateTexture('tile1', 64, 64);
  
  // 浅绿色瓦片
  graphics.clear();
  graphics.fillStyle(0x90EE90, 1); // Light Green
  graphics.fillRect(0, 0, 64, 64);
  graphics.lineStyle(2, 0x7acc7a, 1);
  graphics.strokeRect(0, 0, 64, 64);
  graphics.generateTexture('tile2', 64, 64);
  
  graphics.destroy();
}

function create() {
  const tileSize = gameState.tileSize;
  
  // 创建 3x3 棋盘格数据（交替显示两种颜色）
  const mapData = [
    [1, 2, 1],
    [2, 1, 2],
    [1, 2, 1]
  ];
  
  // 创建空白 Tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: tileSize,
    tileHeight: tileSize
  });
  
  // 添加 Tileset（使用之前生成的纹理）
  const tiles = map.addTilesetImage('tile1', null, tileSize, tileSize);
  
  // 创建图层
  const layer = map.createLayer(0, tiles, 200, 150);
  
  // 手动设置每个瓦片的纹理（因为 Tilemap 默认只能用一个 tileset）
  // 我们需要遍历地图数据来正确设置纹理
  for (let y = 0; y < gameState.mapHeight; y++) {
    for (let x = 0; x < gameState.mapWidth; x++) {
      const tile = layer.getTileAt(x, y);
      if (tile) {
        // 根据数据值设置不同的 tint 或使用不同方式
        gameState.tilesCreated++;
      }
    }
  }
  
  // 由于 Tilemap 的限制，使用 Sprite 方式重新实现棋盘格
  // 这样可以更灵活地使用两种纹理
  layer.destroy();
  
  const startX = 200;
  const startY = 150;
  
  for (let y = 0; y < gameState.mapHeight; y++) {
    for (let x = 0; x < gameState.mapWidth; x++) {
      const tileIndex = mapData[y][x];
      const textureName = tileIndex === 1 ? 'tile1' : 'tile2';
      
      const sprite = this.add.sprite(
        startX + x * tileSize + tileSize / 2,
        startY + y * tileSize + tileSize / 2,
        textureName
      );
      
      gameState.tilesCreated++;
    }
  }
  
  gameState.mapGenerated = true;
  
  // 添加文本显示状态信息
  const statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  statusText.setText([
    `Map Size: ${gameState.mapWidth}x${gameState.mapHeight}`,
    `Tile Size: ${gameState.tileSize}px`,
    `Tiles Created: ${gameState.tilesCreated}`,
    `Map Generated: ${gameState.mapGenerated}`,
    '',
    'Green checkerboard pattern with',
    'alternating dark and light tiles'
  ]);
  
  // 添加标题
  this.add.text(400, 50, '3x3 Green Checkerboard Map', {
    fontSize: '32px',
    fill: '#90EE90',
    fontStyle: 'bold'
  }).setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);