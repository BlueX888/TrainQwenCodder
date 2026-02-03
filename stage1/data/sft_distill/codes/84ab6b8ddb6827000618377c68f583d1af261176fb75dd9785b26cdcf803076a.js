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
let mapData = {
  width: 5,
  height: 5,
  tileCount: 0,
  darkRedTiles: 0,
  lightRedTiles: 0
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  const tileSize = 64;
  
  // 1. 使用 Graphics 生成两种红色纹理
  const graphics = this.add.graphics();
  
  // 深红色纹理 (索引1)
  graphics.fillStyle(0xCC0000, 1);
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('darkRed', tileSize, tileSize);
  graphics.clear();
  
  // 浅红色纹理 (索引2)
  graphics.fillStyle(0xFF6666, 1);
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('lightRed', tileSize, tileSize);
  graphics.destroy();
  
  // 2. 创建 5x5 的二维数组，棋盘格交替模式
  const mapArray = [];
  for (let y = 0; y < 5; y++) {
    const row = [];
    for (let x = 0; x < 5; x++) {
      // 棋盘格规则：(x + y) % 2 决定颜色
      const tileIndex = (x + y) % 2 === 0 ? 1 : 2;
      row.push(tileIndex);
      
      // 统计瓦片数量
      if (tileIndex === 1) {
        mapData.darkRedTiles++;
      } else {
        mapData.lightRedTiles++;
      }
    }
    mapArray.push(row);
  }
  mapData.tileCount = mapData.darkRedTiles + mapData.lightRedTiles;
  
  // 3. 创建 tilemap 对象
  const map = this.make.tilemap({
    data: mapArray,
    tileWidth: tileSize,
    tileHeight: tileSize
  });
  
  // 4. 添加 tileset（包含两种纹理）
  // 注意：需要为每个纹理单独添加 tileset
  const tileset1 = map.addTilesetImage('darkRed', 'darkRed');
  const tileset2 = map.addTilesetImage('lightRed', 'lightRed');
  
  // 5. 创建图层并居中显示
  const layer = map.createLayer(0, [tileset1, tileset2], 0, 0);
  
  // 居中显示棋盘
  const mapWidth = 5 * tileSize;
  const mapHeight = 5 * tileSize;
  layer.setPosition(
    (this.cameras.main.width - mapWidth) / 2,
    (this.cameras.main.height - mapHeight) / 2
  );
  
  // 添加标题文本
  this.add.text(400, 50, '5x5 红色棋盘格地图', {
    fontSize: '32px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 显示状态信息
  const statusText = [
    `地图尺寸: ${mapData.width} x ${mapData.height}`,
    `总瓦片数: ${mapData.tileCount}`,
    `深红色瓦片: ${mapData.darkRedTiles}`,
    `浅红色瓦片: ${mapData.lightRedTiles}`
  ].join('\n');
  
  this.add.text(400, 520, statusText, {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center',
    lineSpacing: 5
  }).setOrigin(0.5);
  
  // 在控制台输出状态信息
  console.log('Tilemap Status:', mapData);
  console.log('Map Array:', mapArray);
}

new Phaser.Game(config);