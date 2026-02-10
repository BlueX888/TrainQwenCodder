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

// 状态变量
let boardData = [];
let tileSize = 60;
let boardSize = 8;
let tilesRendered = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 初始化 8x8 二维数组，交替填充 0 和 1
  boardData = [];
  for (let row = 0; row < boardSize; row++) {
    boardData[row] = [];
    for (let col = 0; col < boardSize; col++) {
      // 棋盘格交替规则：(row + col) % 2
      boardData[row][col] = (row + col) % 2;
    }
  }

  // 创建 Graphics 对象用于绘制棋盘格
  const graphics = this.add.graphics();

  // 定义两种青色系颜色
  const color1 = 0x00CED1; // 深青色 (DarkTurquoise)
  const color2 = 0xAFEEEE; // 浅青色 (PaleTurquoise)

  // 计算棋盘起始位置（居中显示）
  const startX = (config.width - boardSize * tileSize) / 2;
  const startY = (config.height - boardSize * tileSize) / 2;

  // 遍历二维数组绘制棋盘格
  tilesRendered = 0;
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const x = startX + col * tileSize;
      const y = startY + row * tileSize;
      
      // 根据数组值选择颜色
      const color = boardData[row][col] === 0 ? color1 : color2;
      
      // 绘制方块
      graphics.fillStyle(color, 1);
      graphics.fillRect(x, y, tileSize, tileSize);
      
      // 绘制边框
      graphics.lineStyle(2, 0x008B8B, 1);
      graphics.strokeRect(x, y, tileSize, tileSize);
      
      tilesRendered++;
    }
  }

  // 添加标题文本
  const titleText = this.add.text(
    config.width / 2,
    30,
    '8x8 青色棋盘格',
    {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#00CED1',
      fontStyle: 'bold'
    }
  );
  titleText.setOrigin(0.5, 0.5);

  // 添加状态信息文本
  const statusText = this.add.text(
    config.width / 2,
    config.height - 30,
    `棋盘大小: ${boardSize}x${boardSize} | 方块数量: ${tilesRendered}`,
    {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#AFEEEE'
    }
  );
  statusText.setOrigin(0.5, 0.5);

  // 在控制台输出验证信息
  console.log('棋盘数据:', boardData);
  console.log('渲染的方块数量:', tilesRendered);
  console.log('预期方块数量:', boardSize * boardSize);
  
  // 验证数据完整性
  if (tilesRendered === boardSize * boardSize) {
    console.log('✓ 棋盘渲染完成');
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);