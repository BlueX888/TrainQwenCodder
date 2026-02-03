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

// 游戏状态变量
let gameState = {
  totalTiles: 0,      // 总格子数
  lightPinkCount: 0,  // 浅粉色格子数
  darkPinkCount: 0,   // 深粉色格子数
  mapGenerated: false // 地图是否生成完成
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const GRID_SIZE = 12;
  const TILE_SIZE = 48; // 每个格子的像素大小
  const OFFSET_X = 12;  // 左侧偏移
  const OFFSET_Y = 12;  // 顶部偏移
  
  // 定义两种粉色
  const LIGHT_PINK = 0xFFB6C1; // 浅粉色
  const DARK_PINK = 0xFF69B4;  // 深粉色
  
  // 创建12x12的二维数组
  const mapData = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    mapData[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      // 棋盘格模式：(row + col) 为偶数时用一种颜色，奇数时用另一种颜色
      mapData[row][col] = (row + col) % 2;
    }
  }
  
  // 使用Graphics创建两种粉色纹理
  const graphics = this.add.graphics();
  
  // 创建浅粉色纹理
  graphics.fillStyle(LIGHT_PINK, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('lightPink', TILE_SIZE, TILE_SIZE);
  graphics.clear();
  
  // 创建深粉色纹理
  graphics.fillStyle(DARK_PINK, 1);
  graphics.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  graphics.generateTexture('darkPink', TILE_SIZE, TILE_SIZE);
  graphics.clear();
  
  // 销毁graphics对象，释放资源
  graphics.destroy();
  
  // 重置状态变量
  gameState.totalTiles = 0;
  gameState.lightPinkCount = 0;
  gameState.darkPinkCount = 0;
  
  // 遍历二维数组，绘制棋盘格
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = OFFSET_X + col * TILE_SIZE;
      const y = OFFSET_Y + row * TILE_SIZE;
      
      // 根据数组值选择纹理
      const textureName = mapData[row][col] === 0 ? 'lightPink' : 'darkPink';
      
      // 创建图像对象
      const tile = this.add.image(x, y, textureName);
      tile.setOrigin(0, 0); // 设置原点为左上角
      
      // 更新统计
      gameState.totalTiles++;
      if (textureName === 'lightPink') {
        gameState.lightPinkCount++;
      } else {
        gameState.darkPinkCount++;
      }
    }
  }
  
  // 标记地图生成完成
  gameState.mapGenerated = true;
  
  // 添加标题文本
  const titleText = this.add.text(300, 590, 'Pink Checkerboard 12x12', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff',
    align: 'center'
  });
  titleText.setOrigin(0.5, 1);
  
  // 添加统计信息文本
  const statsText = this.add.text(10, 585, 
    `Total: ${gameState.totalTiles} | Light: ${gameState.lightPinkCount} | Dark: ${gameState.darkPinkCount}`, 
    {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );
  
  // 在控制台输出状态信息（用于验证）
  console.log('=== Game State ===');
  console.log('Total Tiles:', gameState.totalTiles);
  console.log('Light Pink Tiles:', gameState.lightPinkCount);
  console.log('Dark Pink Tiles:', gameState.darkPinkCount);
  console.log('Map Generated:', gameState.mapGenerated);
  console.log('Expected: 144 total, 72 light, 72 dark');
}

// 启动游戏
new Phaser.Game(config);