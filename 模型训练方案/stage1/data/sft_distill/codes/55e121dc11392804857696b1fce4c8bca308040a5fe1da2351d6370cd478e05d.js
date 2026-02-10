const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

// 全局状态信号
window.__signals__ = {
  boardSize: 8,
  tileSize: 100,
  totalTiles: 0,
  lightTiles: 0,
  darkTiles: 0,
  boardData: []
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  const boardSize = 8;
  const tileSize = 100;
  
  // 创建 8x8 棋盘数据，交替显示两种颜色
  const boardData = [];
  for (let row = 0; row < boardSize; row++) {
    boardData[row] = [];
    for (let col = 0; col < boardSize; col++) {
      // 棋盘格模式：(row + col) % 2 决定颜色
      boardData[row][col] = (row + col) % 2;
    }
  }
  
  // 保存到信号中
  window.__signals__.boardData = boardData;
  
  // 定义两种粉色
  const lightPink = 0xFFB6C1; // 浅粉色
  const darkPink = 0xFF69B4;  // 深粉色
  
  // 使用 Graphics 创建两种纹理
  const graphics = this.add.graphics();
  
  // 创建浅粉色纹理
  graphics.fillStyle(lightPink, 1);
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('lightPink', tileSize, tileSize);
  graphics.clear();
  
  // 创建深粉色纹理
  graphics.fillStyle(darkPink, 1);
  graphics.fillRect(0, 0, tileSize, tileSize);
  graphics.generateTexture('darkPink', tileSize, tileSize);
  graphics.destroy();
  
  // 绘制棋盘
  let lightCount = 0;
  let darkCount = 0;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      const tileType = boardData[row][col];
      
      if (tileType === 0) {
        // 浅粉色
        this.add.image(x, y, 'lightPink').setOrigin(0, 0);
        lightCount++;
      } else {
        // 深粉色
        this.add.image(x, y, 'darkPink').setOrigin(0, 0);
        darkCount++;
      }
    }
  }
  
  // 更新状态信号
  window.__signals__.totalTiles = boardSize * boardSize;
  window.__signals__.lightTiles = lightCount;
  window.__signals__.darkTiles = darkCount;
  
  // 添加标题文本
  this.add.text(400, 820, '8x8 粉色棋盘格', {
    fontSize: '24px',
    fill: '#FFB6C1',
    fontStyle: 'bold'
  }).setOrigin(0.5, 0);
  
  // 添加统计信息
  this.add.text(400, 850, `浅粉: ${lightCount} | 深粉: ${darkCount}`, {
    fontSize: '18px',
    fill: '#ffffff'
  }).setOrigin(0.5, 0);
  
  // 输出验证日志
  console.log(JSON.stringify({
    type: 'checkerboard_created',
    boardSize: boardSize,
    tileSize: tileSize,
    totalTiles: window.__signals__.totalTiles,
    lightTiles: window.__signals__.lightTiles,
    darkTiles: window.__signals__.darkTiles,
    timestamp: Date.now()
  }));
}

new Phaser.Game(config);