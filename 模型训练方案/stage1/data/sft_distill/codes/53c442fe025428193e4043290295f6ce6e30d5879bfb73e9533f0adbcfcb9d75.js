class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.gridSize = 12; // 12x12 网格
    this.tileSize = 50; // 每个格子的大小
    this.totalTiles = 0; // 状态验证信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建 12x12 的二维数组
    const boardData = [];
    for (let row = 0; row < this.gridSize; row++) {
      boardData[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 根据行列索引奇偶性确定颜色类型
        // 0 代表白色，1 代表灰色
        boardData[row][col] = (row + col) % 2;
      }
    }

    // 创建 Graphics 对象用于绘制棋盘
    const graphics = this.add.graphics();

    // 定义两种颜色
    const color1 = 0xFFFFFF; // 白色
    const color2 = 0x808080; // 灰色

    // 遍历二维数组绘制棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        // 根据数组值选择颜色
        const color = boardData[row][col] === 0 ? color1 : color2;
        
        // 设置填充颜色
        graphics.fillStyle(color, 1);
        
        // 绘制矩形格子
        const x = col * this.tileSize + 100; // 添加偏移使棋盘居中
        const y = row * this.tileSize + 50;
        graphics.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制边框以区分格子
        graphics.lineStyle(1, 0x000000, 0.3);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
        
        // 统计格子总数
        this.totalTiles++;
      }
    }

    // 添加标题文本
    this.add.text(100, 10, '12x12 Checkerboard Pattern', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    });

    // 显示状态信息（验证信号）
    this.add.text(100, this.gridSize * this.tileSize + 60, 
      `Total Tiles: ${this.totalTiles}`, {
      fontSize: '18px',
      color: '#000000'
    });

    // 在控制台输出验证信息
    console.log('Checkerboard created successfully!');
    console.log('Grid size:', this.gridSize, 'x', this.gridSize);
    console.log('Total tiles:', this.totalTiles);
    console.log('Expected tiles:', this.gridSize * this.gridSize);
    console.log('Board data sample:', boardData[0]); // 输出第一行数据
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#F0F0F0',
  scene: CheckerboardScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
const game = new Phaser.Game(config);