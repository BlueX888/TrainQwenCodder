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

// 全局验证信号
window.__signals__ = {
  mapWidth: 0,
  mapHeight: 0,
  totalTiles: 0,
  darkGreenTiles: 0,
  lightGreenTiles: 0,
  tileSize: 0,
  completed: false
};

function preload() {
  // 创建深绿色纹理
  const darkGreen = this.add.graphics();
  darkGreen.fillStyle(0x2d5016, 1);
  darkGreen.fillRect(0, 0, 32, 32);
  darkGreen.generateTexture('darkGreen', 32, 32);
  darkGreen.destroy();

  // 创建浅绿色纹理
  const lightGreen = this.add.graphics();
  lightGreen.fillStyle(0x4a7c2c, 1);
  lightGreen.fillRect(0, 0, 32, 32);
  lightGreen.generateTexture('lightGreen', 32, 32);
  lightGreen.destroy();
}

function create() {
  const mapWidth = 15;
  const mapHeight = 15;
  const tileSize = 32;

  // 创建 Tilemap
  const map = this.make.tilemap({
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: mapWidth,
    height: mapHeight
  });

  // 添加瓦片集（使用我们创建的纹理）
  const darkGreenTiles = map.addTilesetImage('darkGreen');
  const lightGreenTiles = map.addTilesetImage('lightGreen');

  // 创建图层
  const layer = map.createBlankLayer('ground', [darkGreenTiles, lightGreenTiles]);

  // 初始化计数器
  let darkCount = 0;
  let lightCount = 0;

  // 填充棋盘格：使用二维数组逻辑
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      // 棋盘格规则：(x + y) % 2 决定颜色
      if ((x + y) % 2 === 0) {
        // 深绿色，使用索引 0
        layer.putTileAt(0, x, y);
        darkCount++;
      } else {
        // 浅绿色，使用索引 0（但从 lightGreenTiles 瓦片集）
        // 需要通过设置不同的 tileset 来实现
        const tile = layer.putTileAt(0, x, y);
        tile.setTilesetImage(lightGreenTiles);
        lightCount++;
      }
    }
  }

  // 居中显示地图
  const mapPixelWidth = mapWidth * tileSize;
  const mapPixelHeight = mapHeight * tileSize;
  layer.setPosition(
    (this.cameras.main.width - mapPixelWidth) / 2,
    (this.cameras.main.height - mapPixelHeight) / 2
  );

  // 添加标题文本
  this.add.text(10, 10, '15x15 Checkerboard Map', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });

  // 添加信息文本
  this.add.text(10, 45, `Dark Green Tiles: ${darkCount}`, {
    fontSize: '16px',
    color: '#2d5016'
  });

  this.add.text(10, 70, `Light Green Tiles: ${lightCount}`, {
    fontSize: '16px',
    color: '#4a7c2c'
  });

  this.add.text(10, 95, `Total Tiles: ${mapWidth * mapHeight}`, {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 更新验证信号
  window.__signals__.mapWidth = mapWidth;
  window.__signals__.mapHeight = mapHeight;
  window.__signals__.totalTiles = mapWidth * mapHeight;
  window.__signals__.darkGreenTiles = darkCount;
  window.__signals__.lightGreenTiles = lightCount;
  window.__signals__.tileSize = tileSize;
  window.__signals__.completed = true;

  // 输出日志 JSON
  console.log('MAP_CREATED:', JSON.stringify({
    dimensions: `${mapWidth}x${mapHeight}`,
    totalTiles: mapWidth * mapHeight,
    darkGreenTiles: darkCount,
    lightGreenTiles: lightCount,
    tileSize: tileSize,
    timestamp: Date.now()
  }));
}

// 启动游戏
new Phaser.Game(config);