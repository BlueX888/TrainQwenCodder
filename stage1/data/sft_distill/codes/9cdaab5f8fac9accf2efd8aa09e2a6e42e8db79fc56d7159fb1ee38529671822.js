// 固定种子值，可以修改此值来生成不同布局
const FIXED_SEED = ['phaser3', 'deterministic', '2024'];

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacles = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.game.config.seed = FIXED_SEED;
    Phaser.Math.RND.sow(FIXED_SEED);

    // 存储障碍物数据用于验证
    const obstacleData = [];

    // 生成 12 个青色障碍物
    const OBSTACLE_COUNT = 12;
    const PADDING = 50; // 边界填充
    const MIN_WIDTH = 40;
    const MAX_WIDTH = 100;
    const MIN_HEIGHT = 40;
    const MAX_HEIGHT = 100;

    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      // 使用 RND 生成确定性的随机位置和尺寸
      const x = Phaser.Math.RND.between(PADDING, 800 - PADDING - MAX_WIDTH);
      const y = Phaser.Math.RND.between(PADDING, 600 - PADDING - MAX_HEIGHT);
      const width = Phaser.Math.RND.between(MIN_WIDTH, MAX_WIDTH);
      const height = Phaser.Math.RND.between(MIN_HEIGHT, MAX_HEIGHT);

      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ffff, 1); // 青色
      graphics.fillRect(x, y, width, height);

      // 添加边框使障碍物更清晰
      graphics.lineStyle(2, 0x00aaaa, 1);
      graphics.strokeRect(x, y, width, height);

      // 保存障碍物引用
      this.obstacles.push(graphics);

      // 记录障碍物数据
      obstacleData.push({ id: i, x, y, width, height });
    }

    // 显示当前 seed 信息
    const seedText = `Seed: ${FIXED_SEED.join(', ')}`;
    const text = this.add.text(10, 10, seedText, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setDepth(100); // 确保文本在最上层

    // 添加说明文本
    const infoText = this.add.text(10, 45, 'Deterministic Layout\n12 Cyan Obstacles', {
      fontSize: '14px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setDepth(100);

    // 输出验证信号
    window.__signals__ = {
      seed: FIXED_SEED,
      obstacleCount: OBSTACLE_COUNT,
      obstacles: obstacleData,
      timestamp: Date.now(),
      layoutHash: this.calculateLayoutHash(obstacleData)
    };

    // 同时输出到控制台
    console.log('=== Deterministic Layout Generated ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  update(time, delta) {
    // 此场景无需更新逻辑
  }

  // 计算布局哈希值用于快速验证布局一致性
  calculateLayoutHash(obstacles) {
    const dataString = obstacles
      .map(o => `${o.x},${o.y},${o.width},${o.height}`)
      .join('|');
    
    // 简单的字符串哈希函数
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为 32 位整数
    }
    return hash.toString(16);
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  seed: FIXED_SEED, // 设置游戏配置的种子
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证函数：可以调用此函数验证不同 seed 生成不同布局
function verifySeedDeterminism(newSeed) {
  console.log(`\n=== Verifying with seed: ${newSeed} ===`);
  // 修改 FIXED_SEED 并重新创建游戏以验证
  // 注意：实际使用时需要销毁旧游戏实例并创建新实例
}