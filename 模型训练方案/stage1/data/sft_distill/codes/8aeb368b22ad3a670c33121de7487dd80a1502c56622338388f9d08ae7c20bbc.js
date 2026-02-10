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

// 状态信号变量
let gameState = {
  mapWidth: 20,
  mapHeight: 20,
  tileSize: 40,
  tilesGenerated: 0,
  checkboardComplete: false
};

function preload() {
  // 程序化生成两种粉色纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 浅粉色瓦片
  graphics.fillStyle(0xFFB6C1, 1); // Light Pink
  graphics.fillRect(0, 0, gameState.tileSize, gameState.tileSize);
  graphics.generateTexture('tile_light', gameState.tileSize, gameState.tileSize);
  
  // 深粉色瓦片
  graphics.clear();
  graphics.fillStyle(0xFF69B4, 1); // Hot Pink
  graphics.fillRect(0, 0, gameState.tileSize, gameState.tileSize);
  graphics.generateTexture('tile_dark', gameState.tileSize, gameState.tileSize);
  
  graphics.destroy();
}

function create() {
  // 创建 20x20 的二维数组数据
  const mapData = [];
  
  for (let y = 0; y < gameState.mapHeight; y++) {
    const row = [];
    for (let x = 0; x < gameState.mapWidth; x++) {
      // 棋盘格规则：(x + y) 为偶数用瓦片1，奇数用瓦片2
      const tileIndex = (x + y) % 2 === 0 ? 1 : 2;
      row.push(tileIndex);
      gameState.tilesGenerated++;
    }
    mapData.push(row);
  }
  
  // 创建 Tilemap 配置
  const mapConfig = {
    data: mapData,
    tileWidth: gameState.tileSize,
    tileHeight: gameState.tileSize
  };
  
  // 创建 Tilemap
  const map = this.make.tilemap(mapConfig);
  
  // 添加瓦片集（tileset）
  // 第一个参数是 tileset 名称，第二个是纹理 key
  // 注意：索引从1开始，所以 tile_light 对应索引1，tile_dark 对应索引2
  const tileset1 = map.addTilesetImage('tile_light', 'tile_light');
  const tileset2 = map.addTilesetImage('tile_dark', 'tile_dark');
  
  // 创建图层
  const layer = map.createBlankLayer('checkerboard', [tileset1, tileset2], 0, 0);
  
  // 填充图层数据
  for (let y = 0; y < gameState.mapHeight; y++) {
    for (let x = 0; x < gameState.mapWidth; x++) {
      const tileIndex = mapData[y][x];
      layer.putTileAt(tileIndex, x, y);
    }
  }
  
  // 标记完成
  gameState.checkboardComplete = true;
  
  // 居中显示
  const offsetX = (config.width - gameState.mapWidth * gameState.tileSize) / 2;
  const offsetY = (config.height - gameState.mapHeight * gameState.tileSize) / 2;
  layer.setPosition(offsetX, offsetY);
  
  // 添加调试信息文本
  const debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  debugText.setText([
    `Map Size: ${gameState.mapWidth}x${gameState.mapHeight}`,
    `Tiles Generated: ${gameState.tilesGenerated}`,
    `Tile Size: ${gameState.tileSize}px`,
    `Status: ${gameState.checkboardComplete ? 'Complete' : 'Incomplete'}`
  ]);
  
  // 添加边框以突出显示棋盘
  const border = this.add.graphics();
  border.lineStyle(2, 0xffffff, 1);
  border.strokeRect(
    offsetX - 2,
    offsetY - 2,
    gameState.mapWidth * gameState.tileSize + 4,
    gameState.mapHeight * gameState.tileSize + 4
  );
  
  console.log('Checkerboard Generated:', gameState);
}

const game = new Phaser.Game(config);