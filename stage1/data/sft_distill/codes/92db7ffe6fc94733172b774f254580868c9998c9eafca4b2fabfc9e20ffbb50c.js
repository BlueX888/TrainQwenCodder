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
let mapRows = 10;
let mapCols = 10;
let totalTiles = 0;
let tilemapCreated = false;

function preload() {
  // 使用 Graphics 生成两种粉色瓷砖纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 浅粉色瓷砖 (index 0)
  graphics.clear();
  graphics.fillStyle(0xffb3d9, 1); // 浅粉色
  graphics.fillRect(0, 0, 64, 64);
  graphics.lineStyle(2, 0xff99cc, 1); // 边框
  graphics.strokeRect(0, 0, 64, 64);
  graphics.generateTexture('tile0', 64, 64);
  
  // 深粉色瓷砖 (index 1)
  graphics.clear();
  graphics.fillStyle(0xff66b2, 1); // 深粉色
  graphics.fillRect(0, 0, 64, 64);
  graphics.lineStyle(2, 0xff3399, 1); // 边框
  graphics.strokeRect(0, 0, 64, 64);
  graphics.generateTexture('tile1', 64, 64);
  
  graphics.destroy();
}

function create() {
  // 创建 10x10 的二维数组，按棋盘格规则交替填充
  const mapData = [];
  for (let row = 0; row < mapRows; row++) {
    const rowData = [];
    for (let col = 0; col < mapCols; col++) {
      // 棋盘格规则：(row + col) % 2 决定颜色
      const tileIndex = (row + col) % 2;
      rowData.push(tileIndex);
      totalTiles++;
    }
    mapData.push(rowData);
  }
  
  // 创建 Tilemap
  const map = this.make.tilemap({
    data: mapData,
    tileWidth: 64,
    tileHeight: 64
  });
  
  // 添加瓷砖集
  const tiles = map.addTilesetImage('tiles', null, 64, 64, 0, 0);
  
  // 手动设置瓷砖纹理映射
  tiles.setImage(this.textures.get('tile0'));
  
  // 创建图层
  const layer = map.createLayer(0, tiles, 100, 50);
  
  // 手动渲染每个瓷砖（因为动态纹理需要特殊处理）
  for (let row = 0; row < mapRows; row++) {
    for (let col = 0; col < mapCols; col++) {
      const tileIndex = mapData[row][col];
      const textureName = 'tile' + tileIndex;
      
      // 使用 Sprite 或 Image 来显示瓷砖
      const x = 100 + col * 64 + 32; // 中心点
      const y = 50 + row * 64 + 32;
      this.add.image(x, y, textureName).setOrigin(0.5, 0.5);
    }
  }
  
  tilemapCreated = true;
  
  // 添加信息文本
  const infoText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  infoText.setText([
    `棋盘格地图已生成`,
    `地图大小: ${mapRows} x ${mapCols}`,
    `总瓷砖数: ${totalTiles}`,
    `瓷砖大小: 64x64`,
    `状态: ${tilemapCreated ? '已创建' : '未创建'}`
  ]);
  
  // 添加标题
  const title = this.add.text(400, 680, '粉色棋盘格地图 (10x10)', {
    fontSize: '24px',
    fill: '#ff66b2',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  // 添加颜色说明
  const legend = this.add.text(700, 100, '', {
    fontSize: '14px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 8, y: 5 }
  });
  
  legend.setText([
    '颜色说明:',
    '■ 浅粉色',
    '■ 深粉色'
  ]);
  
  // 添加颜色示例
  const lightPinkSample = this.add.rectangle(710, 125, 12, 12, 0xffb3d9);
  const darkPinkSample = this.add.rectangle(710, 142, 12, 12, 0xff66b2);
  
  console.log('棋盘格地图生成完成');
  console.log('地图数据:', mapData);
  console.log('状态信号 - 行数:', mapRows, '列数:', mapCols, '总瓷砖:', totalTiles);
}

new Phaser.Game(config);