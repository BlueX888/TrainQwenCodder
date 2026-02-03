class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = null;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化固定 seed
    this.currentSeed = ['phaser3', 'seed', '12345'];
    this.initializeWithSeed(this.currentSeed);

    // 显示 seed 信息
    this.seedText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateSeedDisplay();

    // 生成障碍物
    this.generateObstacles();

    // 添加重新生成按钮
    const resetButton = this.add.text(10, 50, 'Reset (New Seed)', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });
    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerdown', () => {
      this.resetWithNewSeed();
    });

    // 添加固定 seed 重置按钮
    const fixedResetButton = this.add.text(10, 90, 'Reset (Same Seed)', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });
    fixedResetButton.setInteractive({ useHandCursor: true });
    fixedResetButton.on('pointerdown', () => {
      this.resetWithSameSeed();
    });

    // 输出验证信号
    this.outputSignals();
  }

  initializeWithSeed(seed) {
    // 设置随机数生成器的种子
    this.game.config.seed = seed;
    Phaser.Math.RND.sow(seed);
  }

  updateSeedDisplay() {
    const seedStr = Array.isArray(this.currentSeed) 
      ? this.currentSeed.join('-') 
      : this.currentSeed.toString();
    this.seedText.setText(`Seed: ${seedStr}`);
  }

  generateObstacles() {
    // 清除旧的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    const obstacleCount = 5;
    const obstacleData = [];

    // 使用当前随机数生成器生成障碍物
    for (let i = 0; i < obstacleCount; i++) {
      // 生成随机位置和大小（使用 Phaser 的确定性随机数生成器）
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(150, 550);
      const width = Phaser.Math.Between(40, 80);
      const height = Phaser.Math.Between(40, 80);

      // 使用 Graphics 绘制黄色障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffff00, 1); // 黄色
      graphics.fillRect(0, 0, width, height);
      graphics.setPosition(x, y);

      // 添加边框
      graphics.lineStyle(2, 0xff8800, 1);
      graphics.strokeRect(0, 0, width, height);

      // 添加标签
      const label = this.add.text(width / 2, height / 2, `${i + 1}`, {
        fontSize: '14px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      label.setPosition(x + width / 2, y + height / 2);

      this.obstacles.push(graphics);
      this.obstacles.push(label);

      // 记录障碍物数据
      obstacleData.push({ id: i + 1, x, y, width, height });
    }

    // 保存障碍物数据用于验证
    this.obstacleData = obstacleData;
    this.outputSignals();
  }

  resetWithNewSeed() {
    // 生成新的随机 seed
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.currentSeed = ['phaser3', timestamp.toString(), random.toString()];
    
    this.initializeWithSeed(this.currentSeed);
    this.updateSeedDisplay();
    this.generateObstacles();
  }

  resetWithSameSeed() {
    // 使用相同的 seed 重新生成
    this.initializeWithSeed(this.currentSeed);
    this.updateSeedDisplay();
    this.generateObstacles();
  }

  outputSignals() {
    // 输出可验证的信号
    const seedStr = Array.isArray(this.currentSeed) 
      ? this.currentSeed.join('-') 
      : this.currentSeed.toString();

    window.__signals__ = {
      seed: seedStr,
      obstacleCount: 5,
      obstacles: this.obstacleData || [],
      timestamp: Date.now(),
      // 计算布局哈希用于快速验证
      layoutHash: this.calculateLayoutHash()
    };

    // 同时输出到控制台
    console.log('Game Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  calculateLayoutHash() {
    // 简单的布局哈希计算，用于验证相同 seed 生成相同布局
    if (!this.obstacleData) return 0;
    
    let hash = 0;
    this.obstacleData.forEach(obstacle => {
      hash += obstacle.x * 1000 + obstacle.y * 100 + obstacle.width * 10 + obstacle.height;
    });
    return hash;
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 设置初始随机种子
  seed: ['phaser3', 'seed', '12345']
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  seed: null,
  obstacleCount: 0,
  obstacles: [],
  timestamp: 0,
  layoutHash: 0
};