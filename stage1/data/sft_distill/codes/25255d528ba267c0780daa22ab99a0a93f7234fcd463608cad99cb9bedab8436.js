class DeterministicObstacleScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstacleScene');
    this.currentSeed = ['phaser3', 'deterministic', 'seed'];
    this.obstacles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置固定随机种子以确保确定性生成
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 创建标题文本
    const title = this.add.text(400, 30, 'Deterministic Obstacle Generation', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    title.setOrigin(0.5);

    // 显示当前 seed
    const seedText = this.add.text(400, 70, `Seed: ${this.currentSeed.join(', ')}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00',
      align: 'center'
    });
    seedText.setOrigin(0.5);

    // 提示文本
    const hint = this.add.text(400, 100, 'Press SPACE to regenerate with new seed', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center'
    });
    hint.setOrigin(0.5);

    // 生成 3 个粉色障碍物
    this.generateObstacles();

    // 显示障碍物信息
    this.displayObstacleInfo();

    // 设置键盘输入：按空格键重新生成（使用新 seed）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithNewSeed();
    });

    // 输出可验证信号
    this.exportSignals();
  }

  generateObstacles() {
    // 清除旧障碍物
    this.obstacles.forEach(obstacle => {
      if (obstacle.graphics) {
        obstacle.graphics.destroy();
      }
      if (obstacle.text) {
        obstacle.text.destroy();
      }
    });
    this.obstacles = [];

    // 使用确定性随机数生成 3 个障碍物
    const colors = [0xff69b4, 0xff1493, 0xffc0cb]; // 不同深浅的粉色
    const minSize = 40;
    const maxSize = 100;
    const margin = 50;

    for (let i = 0; i < 3; i++) {
      // 使用 Phaser 的随机数生成器（已设置 seed）
      const x = Phaser.Math.Between(margin + maxSize, 800 - margin - maxSize);
      const y = Phaser.Math.Between(150 + margin, 600 - margin - maxSize);
      const width = Phaser.Math.Between(minSize, maxSize);
      const height = Phaser.Math.Between(minSize, maxSize);
      const color = colors[i % colors.length];

      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 8);

      // 添加边框
      graphics.lineStyle(3, 0xffffff, 0.8);
      graphics.strokeRoundedRect(x - width / 2, y - height / 2, width, height, 8);

      // 添加障碍物编号
      const label = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 保存障碍物信息
      this.obstacles.push({
        id: i + 1,
        x: Math.round(x),
        y: Math.round(y),
        width: width,
        height: height,
        color: color,
        graphics: graphics,
        text: label
      });
    }
  }

  displayObstacleInfo() {
    // 清除旧的信息文本
    if (this.infoText) {
      this.infoText.destroy();
    }

    // 显示障碍物详细信息
    let infoStr = 'Obstacle Info:\n';
    this.obstacles.forEach(obs => {
      infoStr += `#${obs.id}: pos(${obs.x}, ${obs.y}) size(${obs.width}x${obs.height})\n`;
    });

    this.infoText = this.add.text(20, 150, infoStr, {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
  }

  regenerateWithNewSeed() {
    // 生成新的随机 seed
    const timestamp = Date.now();
    this.currentSeed = ['seed', timestamp.toString()];

    // 重新设置 seed
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 更新 seed 显示
    const seedText = this.children.list.find(child => 
      child.type === 'Text' && child.text.startsWith('Seed:')
    );
    if (seedText) {
      seedText.setText(`Seed: ${this.currentSeed.join(', ')}`);
    }

    // 重新生成障碍物
    this.generateObstacles();
    this.displayObstacleInfo();

    // 更新信号
    this.exportSignals();
  }

  exportSignals() {
    // 导出可验证的信号
    window.__signals__ = {
      seed: this.currentSeed,
      obstacleCount: this.obstacles.length,
      obstacles: this.obstacles.map(obs => ({
        id: obs.id,
        x: obs.x,
        y: obs.y,
        width: obs.width,
        height: obs.height,
        color: `0x${obs.color.toString(16).padStart(6, '0')}`
      })),
      timestamp: Date.now()
    };

    // 同时输出到控制台
    console.log('=== Deterministic Generation Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  update(time, delta) {
    // 本示例无需更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DeterministicObstacleScene,
  seed: ['phaser3', 'deterministic', 'seed'] // 初始 seed
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  seed: config.seed,
  obstacleCount: 0,
  obstacles: [],
  timestamp: Date.now()
};