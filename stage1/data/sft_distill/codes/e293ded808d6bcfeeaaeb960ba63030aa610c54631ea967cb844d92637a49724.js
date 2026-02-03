class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    // 可验证的状态信号
    this.gridSize = 12;
    this.tileSize = 50;
    this.tileCount = 0;
    this.lightTiles = 0;
    this.darkTiles = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 定义两种灰色
    const lightGray = 0xcccccc;
    const darkGray = 0x666666;

    // 创建 12x12 的二维数组
    const grid = [];
    for (let row = 0; row < this.gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 棋盘格交替逻辑：(row + col) % 2 决定颜色
        const isLight = (row + col) % 2 === 0;
        grid[row][col] = isLight ? 1 : 0;
      }
    }

    // 计算居中偏移量
    const totalWidth = this.gridSize * this.tileSize;
    const totalHeight = this.gridSize * this.tileSize;
    const offsetX = (this.cameras.main.width - totalWidth) / 2;
    const offsetY = (this.cameras.main.height - totalHeight) / 2;

    // 根据二维数组绘制棋盘
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        const color = grid[row][col] === 1 ? lightGray : darkGray;

        // 使用 Rectangle 绘制每个格子
        const tile = this.add.rectangle(
          x,
          y,
          this.tileSize,
          this.tileSize,
          color
        );
        
        // 设置原点为左上角
        tile.setOrigin(0, 0);

        // 添加边框以便区分格子
        const graphics = this.add.graphics();
        graphics.lineStyle(1, 0x333333, 0.5);
        graphics.strokeRect(x, y, this.tileSize, this.tileSize);

        // 更新统计信息
        this.tileCount++;
        if (grid[row][col] === 1) {
          this.lightTiles++;
        } else {
          this.darkTiles++;
        }
      }
    }

    // 添加标题文本
    const title = this.add.text(
      this.cameras.main.width / 2,
      20,
      '12x12 棋盘格地图',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    title.setOrigin(0.5, 0);

    // 显示统计信息
    const stats = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height - 30,
      `总格子: ${this.tileCount} | 浅色: ${this.lightTiles} | 深色: ${this.darkTiles}`,
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    stats.setOrigin(0.5, 0);

    // 打印状态信息到控制台
    console.log('棋盘生成完成');
    console.log(`网格大小: ${this.gridSize}x${this.gridSize}`);
    console.log(`格子总数: ${this.tileCount}`);
    console.log(`浅色格子: ${this.lightTiles}`);
    console.log(`深色格子: ${this.darkTiles}`);
  }

  update(time, delta) {
    // 棋盘是静态的，不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 800,
  backgroundColor: '#222222',
  scene: CheckerboardScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);