// 完整的 Phaser3 确定性障碍物生成代码
const SEED = ['phaser', 'deterministic', '2024'];
const OBSTACLE_COUNT = 10;

class DeterministicScene extends Phaser.Scene {
  constructor() {
    super('DeterministicScene');
    this.obstacles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化确定性随机数生成器
    this.game.config.seed = SEED;
    Phaser.Math.RND.sow(SEED);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成 10 个橙色障碍物
    this.generateObstacles();

    // 显示 seed 信息
    this.displaySeedInfo();

    // 输出可验证的 signals
    this.exportSignals();

    // 添加重置按钮提示
    const resetText = this.add.text(400, 560, 'Press R to regenerate with same seed', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    resetText.setOrigin(0.5);

    // 按 R 键重新生成（验证确定性）
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
  }

  generateObstacles() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff8c00, 1); // 橙色
    graphics.lineStyle(2, 0xff6600, 1); // 深橙色边框

    const padding = 50;
    const minWidth = 40;
    const maxWidth = 120;
    const minHeight = 40;
    const maxHeight = 120;

    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      // 使用确定性随机数生成位置和尺寸
      const x = Phaser.Math.RND.between(padding, 800 - padding - maxWidth);
      const y = Phaser.Math.RND.between(padding + 80, 600 - padding - maxHeight);
      const width = Phaser.Math.RND.between(minWidth, maxWidth);
      const height = Phaser.Math.RND.between(minHeight, maxHeight);

      // 绘制障碍物
      graphics.fillRect(x, y, width, height);
      graphics.strokeRect(x, y, width, height);

      // 保存障碍物信息
      this.obstacles.push({
        id: i,
        x: x,
        y: y,
        width: width,
        height: height
      });

      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      label.setStroke('#000000', 3);
    }
  }

  displaySeedInfo() {
    // 显示标题
    const title = this.add.text(400, 30, 'Deterministic Obstacle Generation', {
      fontSize: '24px',
      color: '#ff8c00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示 seed 信息
    const seedText = `Seed: [${SEED.join(', ')}]`;
    const seedDisplay = this.add.text(400, 60, seedText, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    });
    seedDisplay.setOrigin(0.5);

    // 显示障碍物数量
    const countText = this.add.text(20, 560, `Obstacles: ${OBSTACLE_COUNT}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  exportSignals() {
    // 输出可验证的 signals
    window.__signals__ = {
      seed: SEED,
      obstacleCount: OBSTACLE_COUNT,
      obstacles: this.obstacles.map(obs => ({
        id: obs.id,
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height
      })),
      timestamp: Date.now(),
      checksum: this.calculateChecksum()
    };

    // 输出 JSON 日志
    console.log('=== Deterministic Generation Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  calculateChecksum() {
    // 计算障碍物位置的校验和（用于验证确定性）
    let sum = 0;
    this.obstacles.forEach(obs => {
      sum += obs.x + obs.y + obs.width + obs.height;
    });
    return sum;
  }

  update(time, delta) {
    // 无需每帧更新
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  seed: SEED, // 设置全局 seed
  scene: DeterministicScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证函数：比较两次生成的结果
window.verifyDeterminism = function() {
  console.log('=== Verification Test ===');
  console.log('Current checksum:', window.__signals__.checksum);
  console.log('Restart the scene (press R) and compare checksums');
  console.log('Same checksum = deterministic generation confirmed');
};

// 自动验证提示
setTimeout(() => {
  console.log('💡 Tip: Call window.verifyDeterminism() to verify deterministic behavior');
}, 1000);