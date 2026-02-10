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
let boardSize = 8;
let tileSize = 64;
let totalTiles = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const graphics = this.add.graphics();
  
  // 生成深橙色纹理（颜色1）
  graphics.fillStyle(0xFF8C00, 1); // 深橙色
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('tile0', tileSize, tileSize);
  
  // 生成浅橙色纹理（颜色2）
  graphics.clear();
  graphics.fillStyle(0xFFB347, 1); // 浅橙色
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('tile1', tileSize, tileSize);
  
  graphics.destroy();
  
  // 创建 8x8 二维数组，交替填充 0 和 1
  const mapData = [];
  for (let y = 0; y < boardSize; y++) {
    const row = [];
    for (let x = 0; x < boardSize; x++) {
      // 棋盘格交替模式：(x + y) % 2
      row.push((x + y) % 2);
      totalTiles++;
    }
    mapData.push(row);
  }
  
  // 创建 Tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: tileSize,
    tileHeight: tileSize
  });
  
  // 添加 Tileset（包含两种颜色的瓦片）
  const tiles = map.addTilesetImage('tiles', null, tileSize, tileSize, 0, 0);
  
  // 手动设置 tileset 的纹理
  tiles.setImage(this.textures.get('tile0'));
  
  // 创建图层
  const layer = map.createLayer(0, tiles, 100, 50);
  
  // 手动渲染每个瓦片（因为我们有两种纹理）
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const tileIndex = mapData[y][x];
      const textureName = `tile${tileIndex}`;
      
      // 使用 sprite 替代 tilemap 的单个瓦片以支持不同纹理
      this.add.image(
        100 + x * tileSize + tileSize / 2,
        50 + y * tileSize + tileSize / 2,
        textureName
      );
    }
  }
  
  // 移除 tilemap layer（我们用 sprite 替代了）
  layer.destroy();
  
  // 添加边框
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(4, 0xFFFFFF, 1);
  borderGraphics.strokeRect(
    100 - 2,
    50 - 2,
    boardSize * tileSize + 4,
    boardSize * tileSize + 4
  );
  
  // 显示状态信号
  const statusText = this.add.text(100, 580, '', {
    fontSize: '18px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  
  statusText.setText([
    `Board Size: ${boardSize}x${boardSize}`,
    `Tile Size: ${tileSize}px`,
    `Total Tiles: ${totalTiles}`,
    `Pattern: Checkerboard (Orange)`
  ]);
  
  // 添加标题
  const titleText = this.add.text(400, 20, '8x8 Orange Checkerboard', {
    fontSize: '24px',
    color: '#FF8C00',
    fontFamily: 'Arial',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5, 0);
  
  // 验证信号：在控制台输出棋盘数据
  console.log('Checkerboard Map Data:', mapData);
  console.log('Status:', {
    boardSize,
    tileSize,
    totalTiles,
    pattern: 'alternating'
  });
}

new Phaser.Game(config);