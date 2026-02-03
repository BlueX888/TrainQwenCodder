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
  mapWidth: 10,
  mapHeight: 10,
  tileSize: 50,
  tilesGenerated: 0,
  checkersCreated: false
};

function preload() {
  // 程序化生成两种粉色纹理
  const tileSize = gameState.tileSize;
  
  // 浅粉色瓦片
  const graphics1 = this.make.graphics({ x: 0, y: 0, add: false });
  graphics1.fillStyle(0xffb6c1, 1); // 浅粉色
  graphics1.fillRect(0, 0, tileSize, tileSize);
  graphics1.lineStyle(2, 0xffc0cb, 1);
  graphics1.strokeRect(0, 0, tileSize, tileSize);
  graphics1.generateTexture('tile0', tileSize, tileSize);
  graphics1.destroy();
  
  // 深粉色瓦片
  const graphics2 = this.make.graphics({ x: 0, y: 0, add: false });
  graphics2.fillStyle(0xff69b4, 1); // 深粉色
  graphics2.fillRect(0, 0, tileSize, tileSize);
  graphics2.lineStyle(2, 0xff1493, 1);
  graphics2.strokeRect(0, 0, tileSize, tileSize);
  graphics2.generateTexture('tile1', tileSize, tileSize);
  graphics2.destroy();
  
  console.log('Textures generated: tile0 (light pink), tile1 (dark pink)');
}

function create() {
  const tileSize = gameState.tileSize;
  const mapWidth = gameState.mapWidth;
  const mapHeight = gameState.mapHeight;
  
  // 创建 10x10 的二维数组，按棋盘格规则填充
  const mapData = [];
  for (let y = 0; y < mapHeight; y++) {
    const row = [];
    for (let x = 0; x < mapWidth; x++) {
      // 棋盘格规则：(x + y) % 2 决定颜色
      row.push((x + y) % 2);
      gameState.tilesGenerated++;
    }
    mapData.push(row);
  }
  
  // 创建 Tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: tileSize,
    tileHeight: tileSize
  });
  
  // 添加 Tileset（包含两种纹理）
  const tiles = map.addTilesetImage('tile0', null, tileSize, tileSize, 0, 0);
  
  // 手动设置 tileset 的纹理映射
  // 由于 addTilesetImage 只能添加单个纹理，我们需要手动处理
  // 这里使用另一种方法：直接用 putTileAt 放置不同纹理的瓦片
  
  // 创建图层
  const layer = map.createBlankLayer('checkerboard', tiles, 0, 0);
  
  // 手动填充瓦片（使用 putTileAt）
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      layer.putTileAt(mapData[y][x], x, y);
    }
  }
  
  // 由于 Phaser Tilemap 的限制，我们采用更直接的方法：使用 Sprite 网格
  layer.destroy();
  map.destroy();
  
  // 使用 Sprite 网格方式重新实现
  const startX = (config.width - mapWidth * tileSize) / 2;
  const startY = (config.height - mapHeight * tileSize) / 2;
  
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const tileType = (x + y) % 2;
      const textureName = `tile${tileType}`;
      
      const sprite = this.add.sprite(
        startX + x * tileSize + tileSize / 2,
        startY + y * tileSize + tileSize / 2,
        textureName
      );
      sprite.setOrigin(0.5, 0.5);
    }
  }
  
  gameState.checkersCreated = true;
  
  // 添加标题文本
  const titleText = this.add.text(
    config.width / 2,
    20,
    'Pink Checkerboard 10x10',
    {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  titleText.setOrigin(0.5, 0);
  
  // 添加状态信息文本
  const statusText = this.add.text(
    config.width / 2,
    config.height - 30,
    `Tiles: ${gameState.tilesGenerated} | Size: ${mapWidth}x${mapHeight} | Status: ${gameState.checkersCreated ? 'Complete' : 'Pending'}`,
    {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );
  statusText.setOrigin(0.5, 0);
  
  console.log('Checkerboard created:', gameState);
  console.log('Map data sample:', mapData.slice(0, 3));
}

new Phaser.Game(config);