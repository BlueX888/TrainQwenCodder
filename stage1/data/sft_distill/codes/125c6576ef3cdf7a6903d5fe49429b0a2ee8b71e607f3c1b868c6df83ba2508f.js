const SEED = 12345; // 固定种子，修改此值会生成不同布局

class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.obstacles = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化随机数生成器
    this.game.config.seed = [SEED.toString()];
    Phaser.Math.RND.sow([SEED.toString()]);

    // 存储障碍物数据用于验证
    const obstacleData = [];

    // 生成 10 个黄色障碍物
    for (let i = 0; i < 10; i++) {
      // 使用确定性随机生成位置和大小
      const x = Phaser.Math.RND.between(50, 750);
      const y = Phaser.Math.RND.between(100, 550);
      const width = Phaser.Math.RND.between(40, 100);
      const height = Phaser.Math.RND.between(40, 100);

      // 使用 Graphics 绘制黄色障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0xFFFF00, 1); // 黄色
      graphics.fillRect(x, y, width, height);

      // 添加边框使障碍物更明显
      graphics.lineStyle(2, 0xFF8800, 1);
      graphics.strokeRect(x, y, width, height);

      // 保存障碍物数据
      const obstacleInfo = { id: i, x, y, width, height };
      this.obstacles.push(obstacleInfo);
      obstacleData.push(obstacleInfo);

      // 在障碍物上显示编号
      this.add.text(x + width / 2, y + height / 2, `${i}`, {
        fontSize: '16px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // 显示 seed 信息
    this.add.text(10, 10, `Seed: ${SEED}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示障碍物数量
    this.add.text(10, 50, `Obstacles: ${this.obstacles.length}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示提示信息
    this.add.text(400, 10, 'Same seed = Same layout', {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);

    // 输出可验证的 signals
    window.__signals__ = {
      seed: SEED,
      obstacleCount: this.obstacles.length,
      obstacles: obstacleData,
      timestamp: Date.now(),
      layoutHash: this.calculateLayoutHash(obstacleData)
    };

    // 输出到控制台用于验证
    console.log('Deterministic Layout Generated:');
    console.log(JSON.stringify(window.__signals__, null, 2));

    // 验证确定性：相同 seed 应生成相同的哈希值
    console.log(`Layout Hash: ${window.__signals__.layoutHash}`);
  }

  // 计算布局哈希值用于验证确定性
  calculateLayoutHash(obstacles) {
    let hash = 0;
    obstacles.forEach(obs => {
      hash += obs.x * 1000 + obs.y * 100 + obs.width * 10 + obs.height;
    });
    return hash;
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: [SEED.toString()], // 设置全局种子
  scene: ObstacleScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 额外的验证功能：可以通过修改 SEED 常量重新运行来验证不同布局
// 相同 SEED 值应该始终生成相同的障碍物布局