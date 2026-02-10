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

// 全局信号对象
window.__signals__ = {
  mapWidth: 0,
  mapHeight: 0,
  tileSize: 0,
  totalTiles: 0,
  darkGreenTiles: 0,
  lightGreenTiles: 0,
  status: 'initializing'
};

function preload() {
  // 使用 Graphics 创建两种绿色纹理
  const graphics = this.add.graphics();
  
  // 深绿色瓦片
  graphics.fillStyle(0x2d5016, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('darkGreen', 32, 32);
  
  // 浅绿色瓦片
  graphics.clear();
  graphics.fillStyle(0x4a7c2c, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('lightGreen', 32, 32);
  
  graphics.destroy();
  
  console.log('[PRELOAD] Textures created: darkGreen, lightGreen');
}

function create() {
  const mapWidth = 15;
  const mapHeight = 15;
  const tileSize = 32;
  
  // 更新信号
  window.__signals__.mapWidth = mapWidth;
  window.__signals__.mapHeight = mapHeight;
  window.__signals__.tileSize = tileSize;
  window.__signals__.totalTiles = mapWidth * mapHeight;
  
  // 创建空白 Tilemap
  const map = this.make.tilemap({
    tileWidth: tileSize,
    tileHeight: tileSize,
    width: mapWidth,
    height: mapHeight
  });
  
  // 添加瓦片集（使用我们创建的纹理）
  const darkTiles = map.addTilesetImage('darkGreen');
  const lightTiles = map.addTilesetImage('lightGreen');
  
  // 创建图层
  const layer = map.createBlankLayer('checkerboard', [darkTiles, lightTiles]);
  
  // 计数器
  let darkCount = 0;
  let lightCount = 0;
  
  // 填充棋盘格
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      // 棋盘格规则：行列索引之和为偶数用深绿，奇数用浅绿
      if ((x + y) % 2 === 0) {
        layer.putTileAt(0, x, y); // 深绿色
        darkCount++;
      } else {
        layer.putTileAt(1, x, y); // 浅绿色
        lightCount++;
      }
    }
  }
  
  // 更新计数信号
  window.__signals__.darkGreenTiles = darkCount;
  window.__signals__.lightGreenTiles = lightCount;
  window.__signals__.status = 'completed';
  
  // 居中显示地图
  const mapPixelWidth = mapWidth * tileSize;
  const mapPixelHeight = mapHeight * tileSize;
  layer.setPosition(
    (config.width - mapPixelWidth) / 2,
    (config.height - mapPixelHeight) / 2
  );
  
  // 添加标题文本
  this.add.text(10, 10, '15x15 绿色棋盘格地图', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  // 添加信息文本
  const infoText = [
    `地图尺寸: ${mapWidth} x ${mapHeight}`,
    `瓦片大小: ${tileSize}px`,
    `总瓦片数: ${window.__signals__.totalTiles}`,
    `深绿瓦片: ${darkCount}`,
    `浅绿瓦片: ${lightCount}`
  ].join('\n');
  
  this.add.text(10, 45, infoText, {
    fontSize: '16px',
    color: '#cccccc',
    fontFamily: 'Arial',
    lineSpacing: 5
  });
  
  // 输出日志 JSON
  console.log('[GAME] Signals:', JSON.stringify(window.__signals__, null, 2));
  console.log('[GAME] Checkerboard map created successfully');
}

new Phaser.Game(config);