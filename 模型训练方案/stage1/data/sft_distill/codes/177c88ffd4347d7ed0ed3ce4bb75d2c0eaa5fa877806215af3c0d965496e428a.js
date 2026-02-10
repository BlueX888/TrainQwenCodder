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

// 状态变量（用于验证）
let gameState = {
  totalTiles: 64,
  renderedTiles: 0,
  gridSize: 8,
  tileSize: 100
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建8x8的二维数组，使用棋盘格模式（0和1交替）
  const gridData = [];
  for (let row = 0; row < 8; row++) {
    gridData[row] = [];
    for (let col = 0; col < 8; col++) {
      // 棋盘格模式：当行+列为偶数时为0，奇数时为1
      gridData[row][col] = (row + col) % 2;
    }
  }

  // 定义两种青色系颜色
  const color1 = 0x00CED1; // 深青色 (DarkTurquoise)
  const color2 = 0x7FFFD4; // 浅青色 (Aquamarine)

  // 创建Graphics对象用于绘制
  const graphics = this.add.graphics();

  // 计算起始位置使棋盘居中
  const startX = (config.width - gameState.tileSize * gameState.gridSize) / 2;
  const startY = (config.height - gameState.tileSize * gameState.gridSize) / 2;

  // 遍历二维数组绘制棋盘格
  for (let row = 0; row < gameState.gridSize; row++) {
    for (let col = 0; col < gameState.gridSize; col++) {
      const x = startX + col * gameState.tileSize;
      const y = startY + row * gameState.tileSize;

      // 根据数组值选择颜色
      const fillColor = gridData[row][col] === 0 ? color1 : color2;
      
      // 绘制方格
      graphics.fillStyle(fillColor, 1);
      graphics.fillRect(x, y, gameState.tileSize, gameState.tileSize);

      // 绘制边框使格子更清晰
      graphics.lineStyle(2, 0xFFFFFF, 0.3);
      graphics.strokeRect(x, y, gameState.tileSize, gameState.tileSize);

      // 更新已绘制计数
      gameState.renderedTiles++;
    }
  }

  // 添加标题文本
  const titleText = this.add.text(
    config.width / 2,
    30,
    '8x8 青色棋盘格',
    {
      fontSize: '32px',
      color: '#00CED1',
      fontStyle: 'bold'
    }
  );
  titleText.setOrigin(0.5);

  // 添加状态信息文本（用于验证）
  const statusText = this.add.text(
    config.width / 2,
    config.height - 30,
    `已渲染: ${gameState.renderedTiles}/${gameState.totalTiles} 格子`,
    {
      fontSize: '20px',
      color: '#7FFFD4'
    }
  );
  statusText.setOrigin(0.5);

  // 在控制台输出状态信息
  console.log('棋盘格状态:', gameState);
  console.log('棋盘数据:', gridData);
}

// 创建游戏实例
new Phaser.Game(config);