class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = ['phaser3', 'deterministic', 'seed']; // 固定 seed 数组
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals 用于验证
    window.__signals__ = {
      seed: this.currentSeed.join(','),
      obstacles: [],
      timestamp: Date.now()
    };

    // 设置确定性随机种子
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed.join(',')}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 添加说明文本
    this.add.text(10, 50, 'Press SPACE to regenerate with new seed', {
      fontSize: '14px',
      color: '#cccccc'
    });

    this.add.text(10, 75, 'Press R to reset with same seed', {
      fontSize: '14px',
      color: '#cccccc'
    });

    // 生成 10 个橙色障碍物
    this.generateObstacles();

    // 显示障碍物计数
    this.add.text(10, 110, `Obstacles: ${this.obstacles.length}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithNewSeed();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    // 输出验证日志
    console.log('=== Deterministic Obstacles Generated ===');
    console.log('Seed:', window.__signals__.seed);
    console.log('Obstacles:', JSON.stringify(window.__signals__.obstacles, null, 2));
  }

  generateObstacles() {
    const graphics = this.add.graphics();
    const obstacleCount = 10;
    const padding = 50;
    const minSize = 30;
    const maxSize = 80;

    // 橙色
    const orangeColor = 0xFF8800;

    for (let i = 0; i < obstacleCount; i++) {
      // 使用确定性随机生成位置和大小
      const x = Phaser.Math.RND.between(padding, this.game.config.width - padding - maxSize);
      const y = Phaser.Math.RND.between(padding + 150, this.game.config.height - padding - maxSize);
      const width = Phaser.Math.RND.between(minSize, maxSize);
      const height = Phaser.Math.RND.between(minSize, maxSize);

      // 绘制橙色矩形障碍物
      graphics.fillStyle(orangeColor, 1);
      graphics.fillRect(x, y, width, height);

      // 添加边框使障碍物更明显
      graphics.lineStyle(2, 0xFFAA44, 1);
      graphics.strokeRect(x, y, width, height);

      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '14px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 记录障碍物信息
      const obstacleData = {
        id: i + 1,
        x: x,
        y: y,
        width: width,
        height: height
      };
      this.obstacles.push(obstacleData);
      window.__signals__.obstacles.push(obstacleData);
    }
  }

  regenerateWithNewSeed() {
    // 生成新的随机 seed
    const timestamp = Date.now();
    this.currentSeed = ['seed', timestamp.toString()];
    
    console.log('=== Regenerating with new seed ===');
    console.log('New Seed:', this.currentSeed.join(','));
    
    this.scene.restart();
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DeterministicObstaclesScene,
  seed: ['phaser3', 'deterministic', 'seed'] // 初始固定 seed
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出验证函数
window.verifyDeterminism = function() {
  console.log('=== Determinism Verification ===');
  console.log('Current Seed:', window.__signals__.seed);
  console.log('Obstacle Count:', window.__signals__.obstacles.length);
  console.log('First Obstacle:', window.__signals__.obstacles[0]);
  console.log('Last Obstacle:', window.__signals__.obstacles[9]);
  
  // 计算障碍物位置哈希用于快速验证
  const positionHash = window.__signals__.obstacles
    .map(o => `${o.x},${o.y},${o.width},${o.height}`)
    .join('|');
  console.log('Position Hash:', positionHash);
  
  return {
    seed: window.__signals__.seed,
    obstacleCount: window.__signals__.obstacles.length,
    positionHash: positionHash
  };
};

console.log('Game initialized. Call window.verifyDeterminism() to verify deterministic generation.');
console.log('Press SPACE to generate new layout with different seed.');
console.log('Press R to reset with same seed and verify consistency.');