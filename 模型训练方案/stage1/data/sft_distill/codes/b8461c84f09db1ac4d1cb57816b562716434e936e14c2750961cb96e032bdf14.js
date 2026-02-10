const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 状态变量
let gameState = {
  rows: 12,
  cols: 12,
  tileSize: 60,
  boardData: [],
  tilesCreated: 0
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化12x12的二维数组
  for (let row = 0; row < gameState.rows; row++) {
    gameState.boardData[row] = [];
    for (let col = 0; col < gameState.cols; col++) {
      gameState.boardData[row][col] = (row + col) % 2; // 0或1表示两种颜色
    }
  }

  // 计算居中偏移
  const boardWidth = gameState.cols * gameState.tileSize;
  const boardHeight = gameState.rows * gameState.tileSize;
  const offsetX = (config.width - boardWidth) / 2;
  const offsetY = (config.height - boardHeight) / 2;

  // 定义两种紫色
  const color1 = 0x6a0dad; // 深紫色
  const color2 = 0x9370db; // 浅紫色

  // 绘制棋盘格
  for (let row = 0; row < gameState.rows; row++) {
    for (let col = 0; col < gameState.cols; col++) {
      const x = offsetX + col * gameState.tileSize;
      const y = offsetY + row * gameState.tileSize;
      
      // 根据数组值选择颜色
      const color = gameState.boardData[row][col] === 0 ? color1 : color2;
      
      // 使用Rectangle绘制格子
      const tile = this.add.rectangle(
        x,
        y,
        gameState.tileSize,
        gameState.tileSize,
        color
      );
      
      // 设置原点为左上角
      tile.setOrigin(0, 0);
      
      // 添加边框以清晰显示格子边界
      const graphics = this.add.graphics();
      graphics.lineStyle(1, 0x000000, 0.3);
      graphics.strokeRect(x, y, gameState.tileSize, gameState.tileSize);
      
      gameState.tilesCreated++;
    }
  }

  // 添加标题文本
  const titleText = this.add.text(
    config.width / 2,
    20,
    '12x12 紫色棋盘格',
    {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }
  );
  titleText.setOrigin(0.5, 0);

  // 添加状态信息文本
  const infoText = this.add.text(
    config.width / 2,
    config.height - 30,
    `格子总数: ${gameState.tilesCreated} | 尺寸: ${gameState.rows}x${gameState.cols}`,
    {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }
  );
  infoText.setOrigin(0.5, 0);

  // 输出状态到控制台用于验证
  console.log('棋盘状态:', gameState);
  console.log('二维数组示例（前3行）:', gameState.boardData.slice(0, 3));
}

// 启动游戏
new Phaser.Game(config);