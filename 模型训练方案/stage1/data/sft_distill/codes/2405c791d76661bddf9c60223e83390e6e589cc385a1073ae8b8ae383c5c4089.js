const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  scene: { preload, create },
  backgroundColor: '#000000'
};

// 验证信号
window.__signals__ = {
  mapWidth: 0,
  mapHeight: 0,
  tileCount: 0,
  tilesCreated: false,
  mapGenerated: false
};

function preload() {
  // 使用Graphics程序化生成两种红色tile纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 深红色tile
  graphics.fillStyle(0xcc0000, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('tile0', 40, 40);
  graphics.clear();
  
  // 浅红色tile
  graphics.fillStyle(0xff6666, 1);
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('tile1', 40, 40);
  graphics.destroy();
  
  window.__signals__.tilesCreated = true;
  console.log(JSON.stringify({ event: 'tiles_created', tiles: ['tile0', 'tile1'] }));
}

function create() {
  const GRID_SIZE = 20;
  const TILE_SIZE = 40;
  
  // 生成20x20的二维数组，棋盘格交替模式
  const mapData = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // 棋盘格规则：(x + y) % 2 决定颜色
      const tileIndex = (x + y) % 2;
      row.push(tileIndex);
    }
    mapData.push(row);
  }
  
  // 创建tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE
  });
  
  // 添加tileset（使用我们创建的纹理）
  const tiles = map.addTilesetImage('tile0', 'tile0');
  const tiles2 = map.addTilesetImage('tile1', 'tile1');
  
  // 创建layer
  const layer = map.createLayer(0, [tiles, tiles2], 0, 0);
  
  // 居中显示
  const offsetX = (this.cameras.main.width - GRID_SIZE * TILE_SIZE) / 2;
  const offsetY = (this.cameras.main.height - GRID_SIZE * TILE_SIZE) / 2;
  layer.setPosition(offsetX, offsetY);
  
  // 更新验证信号
  window.__signals__.mapWidth = GRID_SIZE;
  window.__signals__.mapHeight = GRID_SIZE;
  window.__signals__.tileCount = GRID_SIZE * GRID_SIZE;
  window.__signals__.mapGenerated = true;
  
  // 添加边框以便更好地可视化
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokeRect(
    offsetX - 2,
    offsetY - 2,
    GRID_SIZE * TILE_SIZE + 4,
    GRID_SIZE * TILE_SIZE + 4
  );
  
  // 添加文本说明
  this.add.text(10, 10, 'Red Checkerboard Map (20x20)', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  this.add.text(10, 40, `Tiles: ${window.__signals__.tileCount}`, {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 输出验证日志
  console.log(JSON.stringify({
    event: 'map_generated',
    width: GRID_SIZE,
    height: GRID_SIZE,
    totalTiles: GRID_SIZE * GRID_SIZE,
    tileSize: TILE_SIZE,
    signals: window.__signals__
  }));
}

new Phaser.Game(config);