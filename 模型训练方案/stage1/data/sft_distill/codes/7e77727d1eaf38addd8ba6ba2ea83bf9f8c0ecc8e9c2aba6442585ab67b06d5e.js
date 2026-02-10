const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 状态信号变量
let mapRows = 0;
let mapCols = 0;
let totalTiles = 0;

function preload() {
  // 预加载阶段（本例不需要外部资源）
}

function create() {
  const tileSize = 150; // 每个瓦片的大小
  const mapWidth = 3;
  const mapHeight = 3;
  
  // 使用 Graphics 创建两种红色纹理
  const graphics = this.add.graphics();
  
  // 深红色瓦片 (索引 0)
  graphics.fillStyle(0xCC0000, 1);
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('tile0', tileSize, tileSize);
  graphics.clear();
  
  // 浅红色瓦片 (索引 1)
  graphics.fillStyle(0xFF6666, 1);
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('tile1', tileSize, tileSize);
  graphics.destroy();
  
  // 创建 3x3 的二维数组，交替填充 0 和 1
  const mapData = [];
  for (let y = 0; y < mapHeight; y++) {
    const row = [];
    for (let x = 0; x < mapWidth; x++) {
      // 棋盘格模式：(x + y) % 2 决定颜色
      row.push((x + y) % 2);
    }
    mapData.push(row);
  }
  
  // 创建 Tilemap
  const map = this.make.tilemap({
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: mapWidth,
    height: mapHeight
  });
  
  // 添加两个瓦片纹理到 tileset
  const tiles0 = map.addTilesetImage('tile0', null, tileSize, tileSize);
  const tiles1 = map.addTilesetImage('tile1', null, tileSize, tileSize);
  
  // 创建图层
  const layer = map.createBlankLayer('layer1', [tiles0, tiles1], 0, 0, mapWidth, mapHeight, tileSize, tileSize);
  
  // 根据二维数组填充瓦片
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const tileIndex = mapData[y][x];
      layer.putTileAt(tileIndex, x, y);
    }
  }
  
  // 更新状态信号
  mapRows = mapHeight;
  mapCols = mapWidth;
  totalTiles = mapWidth * mapHeight;
  
  // 添加文本显示状态信息
  const statusText = this.add.text(10, 460, '', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  statusText.setText([
    `Map Size: ${mapCols}x${mapRows}`,
    `Total Tiles: ${totalTiles}`,
    `Pattern: Checkerboard (Red)`
  ]);
  
  // 添加网格线以更清晰地显示棋盘格
  const gridGraphics = this.add.graphics();
  gridGraphics.lineStyle(2, 0x000000, 0.3);
  
  for (let i = 0; i <= mapWidth; i++) {
    gridGraphics.lineBetween(i * tileSize, 0, i * tileSize, mapHeight * tileSize);
  }
  
  for (let i = 0; i <= mapHeight; i++) {
    gridGraphics.lineBetween(0, i * tileSize, mapWidth * tileSize, i * tileSize);
  }
  
  console.log('Tilemap created successfully!');
  console.log('Map Data:', mapData);
  console.log('Status:', { mapRows, mapCols, totalTiles });
}

const game = new Phaser.Game(config);