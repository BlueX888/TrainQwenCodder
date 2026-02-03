class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 状态信号变量
    this.totalTiles = 0;
    this.renderedTiles = 0;
    this.isComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义5x5的二维数组表示棋盘格
    const boardData = [
      [0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0],
      [1, 0, 1, 0, 1],
      [0, 1, 0, 1, 0]
    ];

    // 棋盘格配置
    const tileSize = 80; // 每个格子的大小
    const startX = 100;  // 起始X坐标
    const startY = 50;   // 起始Y坐标

    // 两种粉色
    const pinkColor1 = 0xFFB6C1; // 浅粉色
    const pinkColor2 = 0xFF69B4; // 深粉色

    // 创建Graphics对象用于绘制
    const graphics = this.add.graphics();

    // 遍历二维数组绘制棋盘格
    for (let row = 0; row < boardData.length; row++) {
      for (let col = 0; col < boardData[row].length; col++) {
        const x = startX + col * tileSize;
        const y = startY + row * tileSize;
        
        // 根据数组值选择颜色（0为浅粉色，1为深粉色）
        const color = boardData[row][col] === 0 ? pinkColor1 : pinkColor2;
        
        // 绘制方块
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, tileSize, tileSize);
        
        // 绘制边框使格子更清晰
        graphics.lineStyle(2, 0xFFFFFF, 1);
        graphics.strokeRect(x, y, tileSize, tileSize);
        
        // 更新状态
        this.renderedTiles++;
      }
    }

    // 计算总格子数
    this.totalTiles = boardData.length * boardData[0].length;
    this.isComplete = true;

    // 添加标题文字
    this.add.text(100, 10, 'Pink Checkerboard 5x5', {
      fontSize: '24px',
      color: '#FF69B4',
      fontStyle: 'bold'
    });

    // 显示状态信息
    const statusText = this.add.text(100, 490, '', {
      fontSize: '18px',
      color: '#FFFFFF'
    });
    statusText.setText([
      `Total Tiles: ${this.totalTiles}`,
      `Rendered Tiles: ${this.renderedTiles}`,
      `Status: ${this.isComplete ? 'Complete' : 'Rendering...'}`
    ]);

    // 添加交互说明
    this.add.text(100, 560, 'Click to log board state', {
      fontSize: '16px',
      color: '#CCCCCC'
    });

    // 添加点击事件验证状态
    this.input.on('pointerdown', () => {
      console.log('=== Checkerboard Status ===');
      console.log('Total Tiles:', this.totalTiles);
      console.log('Rendered Tiles:', this.renderedTiles);
      console.log('Is Complete:', this.isComplete);
      console.log('Board Data:', boardData);
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: CheckerboardScene
};

// 创建游戏实例
const game = new Phaser.Game(config);