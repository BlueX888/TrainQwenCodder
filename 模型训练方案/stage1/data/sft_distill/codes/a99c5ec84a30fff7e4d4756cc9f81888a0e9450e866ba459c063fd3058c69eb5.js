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

// 状态变量
let gameState = {
  rows: 10,
  cols: 10,
  tileSize: 50,
  totalTiles: 0,
  lightTiles: 0,
  darkTiles: 0
};

function preload() {
  // 使用 Graphics 生成两种粉色纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 浅粉色瓦片
  graphics.fillStyle(0xFFB6C1, 1); // Light Pink
  graphics.fillRect(0, 0, gameState.tileSize, gameState.tileSize);
  graphics.generateTexture('tile-light', gameState.tileSize, gameState.tileSize);
  
  // 深粉色瓦片
  graphics.clear();
  graphics.fillStyle(0xFF69B4, 1); // Hot Pink
  graphics.fillRect(0, 0, gameState.tileSize, gameState.tileSize);
  graphics.generateTexture('tile-dark', gameState.tileSize, gameState.tileSize);
  
  graphics.destroy();
}

function create() {
  // 创建 10x10 的二维数组，棋盘格交替模式
  const mapData = [];
  for (let row = 0; row < gameState.rows; row++) {
    const rowData = [];
    for (let col = 0; col < gameState.cols; col++) {
      // 棋盘格规则：(row + col) % 2 决定颜色
      const tileIndex = (row + col) % 2;
      rowData.push(tileIndex);
      
      // 统计瓦片数量
      if (tileIndex === 0) {
        gameState.lightTiles++;
      } else {
        gameState.darkTiles++;
      }
    }
    mapData.push(rowData);
  }
  gameState.totalTiles = gameState.rows * gameState.cols;
  
  // 创建 Tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: gameState.tileSize,
    tileHeight: gameState.tileSize
  });
  
  // 添加 Tileset（关联纹理）
  const tiles = map.addTilesetImage('tiles', null, gameState.tileSize, gameState.tileSize, 0, 0);
  
  // 手动设置 tileset 的纹理映射
  // 索引 0 -> tile-light, 索引 1 -> tile-dark
  map.tilesets[0].setImage(this.textures.get('tile-light'));
  
  // 创建图层
  const layer = map.createLayer(0, tiles, 100, 50);
  
  // 由于 Phaser 的 Tilemap 限制，我们使用 Graphics 直接绘制棋盘
  // 这样可以更好地控制颜色映射
  const boardGraphics = this.add.graphics();
  const startX = 100;
  const startY = 50;
  
  for (let row = 0; row < gameState.rows; row++) {
    for (let col = 0; col < gameState.cols; col++) {
      const x = startX + col * gameState.tileSize;
      const y = startY + row * gameState.tileSize;
      
      // 根据棋盘格规则选择颜色
      if ((row + col) % 2 === 0) {
        boardGraphics.fillStyle(0xFFB6C1, 1); // Light Pink
      } else {
        boardGraphics.fillStyle(0xFF69B4, 1); // Hot Pink
      }
      
      boardGraphics.fillRect(x, y, gameState.tileSize, gameState.tileSize);
      
      // 添加边框使格子更清晰
      boardGraphics.lineStyle(1, 0xFFFFFF, 0.3);
      boardGraphics.strokeRect(x, y, gameState.tileSize, gameState.tileSize);
    }
  }
  
  // 显示状态信息
  const infoText = this.add.text(100, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  infoText.setText([
    `棋盘尺寸: ${gameState.rows} x ${gameState.cols}`,
    `总瓦片数: ${gameState.totalTiles}`,
    `浅粉色: ${gameState.lightTiles} | 深粉色: ${gameState.darkTiles}`,
    `瓦片大小: ${gameState.tileSize}px`
  ]);
  
  // 添加标题
  const title = this.add.text(400, 570, '粉色棋盘格地图 (10x10)', {
    fontSize: '20px',
    fill: '#FFB6C1',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 输出状态到控制台
  console.log('=== 棋盘状态 ===');
  console.log('地图数据:', mapData);
  console.log('游戏状态:', gameState);
  console.log('================');
}

new Phaser.Game(config);