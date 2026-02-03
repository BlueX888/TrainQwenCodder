class DeterministicObstacleScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstacleScene');
    this.currentSeed = ['phaser3', 'deterministic', '2024'];
    this.obstacles = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 生成 10 个橙色障碍物
    this.generateObstacles();

    // 显示当前 seed 信息
    this.displaySeedInfo();

    // 添加重新生成按钮提示
    this.addInstructions();

    // 输出验证信号
    this.outputSignals();

    // 添加键盘事件：按 R 键重新生成（相同 seed）
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    // 添加键盘事件：按 N 键使用新 seed
    this.input.keyboard.on('keydown-N', () => {
      this.currentSeed = ['phaser3', 'seed', Date.now().toString()];
      this.scene.restart();
    });
  }

  generateObstacles() {
    const graphics = this.add.graphics();
    const obstacleData = [];

    // 定义障碍物生成区域（避免边缘）
    const margin = 50;
    const minWidth = 40;
    const maxWidth = 120;
    const minHeight = 40;
    const maxHeight = 120;

    for (let i = 0; i < 10; i++) {
      // 使用确定性随机数生成位置和大小
      const x = Phaser.Math.RND.between(margin, 800 - margin - maxWidth);
      const y = Phaser.Math.RND.between(margin + 80, 600 - margin - maxHeight);
      const width = Phaser.Math.RND.between(minWidth, maxWidth);
      const height = Phaser.Math.RND.between(minHeight, maxHeight);

      // 绘制橙色障碍物
      graphics.fillStyle(0xff8c00, 1); // 橙色
      graphics.fillRect(x, y, width, height);

      // 添加边框使障碍物更明显
      graphics.lineStyle(2, 0xffa500, 1);
      graphics.strokeRect(x, y, width, height);

      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 保存障碍物数据
      const obstacleInfo = { id: i + 1, x, y, width, height };
      obstacleData.push(obstacleInfo);
      this.obstacles.push(obstacleInfo);
    }

    // 存储障碍物数据用于验证
    this.obstacleData = obstacleData;
  }

  displaySeedInfo() {
    // 显示标题
    const title = this.add.text(400, 30, '确定性障碍物生成演示', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示当前 seed
    const seedText = `Seed: ${JSON.stringify(this.currentSeed)}`;
    const seedDisplay = this.add.text(400, 60, seedText, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    seedDisplay.setOrigin(0.5);

    // 显示障碍物数量
    const countText = this.add.text(20, 570, `障碍物数量: ${this.obstacles.length}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
  }

  addInstructions() {
    const instructions = [
      '按 R 键: 重新生成 (相同 seed)',
      '按 N 键: 使用新 seed 生成'
    ];

    instructions.forEach((text, index) => {
      this.add.text(20, 520 + index * 25, text, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#aaaaaa'
      });
    });
  }

  outputSignals() {
    // 输出验证信号到全局对象
    window.__signals__ = {
      seed: this.currentSeed,
      obstacleCount: this.obstacles.length,
      obstacles: this.obstacles.map(obs => ({
        id: obs.id,
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height
      })),
      timestamp: Date.now(),
      deterministic: true
    };

    // 输出到控制台便于验证
    console.log('=== Deterministic Generation Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
    console.log('========================================');
  }

  update(time, delta) {
    // 本场景无需每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  parent: 'game-container',
  scene: DeterministicObstacleScene,
  seed: ['phaser3', 'deterministic', '2024'] // 设置全局种子
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证函数：检查两次生成是否一致
function verifyDeterminism() {
  console.log('=== Determinism Verification ===');
  const firstRun = { ...window.__signals__ };
  
  // 重启场景
  game.scene.scenes[0].scene.restart();
  
  setTimeout(() => {
    const secondRun = { ...window.__signals__ };
    const isIdentical = JSON.stringify(firstRun.obstacles) === JSON.stringify(secondRun.obstacles);
    console.log('First run obstacles:', firstRun.obstacles);
    console.log('Second run obstacles:', secondRun.obstacles);
    console.log('Is deterministic:', isIdentical);
  }, 100);
}

// 导出验证函数供外部调用
window.verifyDeterminism = verifyDeterminism;