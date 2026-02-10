class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.tileSize = 30; // 每个格子的大小
    this.gridSize = 20; // 20x20 网格
    this.mapData = []; // 二维数组存储地图数据
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      mapGenerated: false,
      totalTiles: 0,
      darkRedTiles: 0,
      lightRedTiles: 0,
      gridSize: this.gridSize,
      timestamp: Date.now()
    };

    // 定义两种红色
    const darkRed = 0xCC0000;   // 深红色
    const lightRed = 0xFF6666;  // 浅红色

    // 生成二维数组地图数据
    for (let row = 0; row < this.gridSize; row++) {
      this.mapData[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 交替模式：(row + col) % 2 决定颜色
        const colorType = (row + col) % 2;
        this.mapData[row][col] = colorType;
      }
    }

    // 创建 Graphics 对象绘制棋盘
    const graphics = this.add.graphics();

    // 遍历二维数组并绘制格子
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = col * this.tileSize + 50; // 偏移50像素作为边距
        const y = row * this.tileSize + 50;
        
        // 根据数组值选择颜色
        const color = this.mapData[row][col] === 0 ? darkRed : lightRed;
        
        // 绘制格子
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, this.tileSize, this.tileSize);
        
        // 绘制格子边框（可选，使棋盘更清晰）
        graphics.lineStyle(1, 0x000000, 0.3);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);
        
        // 统计信息
        window.__signals__.totalTiles++;
        if (this.mapData[row][col] === 0) {
          window.__signals__.darkRedTiles++;
        } else {
          window.__signals__.lightRedTiles++;
        }
      }
    }

    // 添加标题文本
    this.add.text(50, 10, '20x20 红色棋盘格地图', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 添加统计信息文本
    const statsText = `深红格子: ${window.__signals__.darkRedTiles} | 浅红格子: ${window.__signals__.lightRedTiles}`;
    this.add.text(50, this.gridSize * this.tileSize + 70, statsText, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 标记地图生成完成
    window.__signals__.mapGenerated = true;

    // 输出验证日志
    console.log('=== 棋盘地图生成完成 ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
    console.log('地图数据示例（前3行）:', this.mapData.slice(0, 3));

    // 添加交互提示
    this.add.text(50, this.gridSize * this.tileSize + 100, '棋盘格已生成完成', {
      fontSize: '14px',
      color: '#cccccc'
    });
  }

  update(time, delta) {
    // 本示例无需更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#222222',
  scene: CheckerboardScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
const game = new Phaser.Game(config);