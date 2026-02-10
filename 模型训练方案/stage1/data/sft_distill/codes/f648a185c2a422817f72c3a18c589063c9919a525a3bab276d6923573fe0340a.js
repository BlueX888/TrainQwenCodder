class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.currentSeed = null;
    this.obstacleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定的随机种子
    this.currentSeed = ['phaser3', 'deterministic', 'layout'];
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed.join(', ')}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(1000);

    // 显示障碍物数量
    this.obstacleCountText = this.add.text(10, 40, `Obstacles: 0`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.obstacleCountText.setDepth(1000);

    // 生成 12 个紫色障碍物
    this.obstacles = [];
    this.generateObstacles();

    // 更新障碍物计数
    this.obstacleCount = this.obstacles.length;
    this.obstacleCountText.setText(`Obstacles: ${this.obstacleCount}`);

    // 添加说明文本
    this.add.text(10, 70, 'Press SPACE to regenerate with new seed', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(1000);

    this.add.text(10, 100, 'Press R to reset with same seed', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(1000);

    // 添加键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithNewSeed();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.resetWithSameSeed();
    });
  }

  generateObstacles() {
    // 清除现有障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    const graphics = this.add.graphics();
    
    // 定义游戏区域边界（避免障碍物生成在 UI 文本区域）
    const margin = 50;
    const minX = margin;
    const maxX = this.game.config.width - margin;
    const minY = 150; // 避开顶部 UI
    const maxY = this.game.config.height - margin;

    // 生成 12 个障碍物
    for (let i = 0; i < 12; i++) {
      // 使用确定性随机生成位置和尺寸
      const x = Phaser.Math.RND.between(minX, maxX - 100);
      const y = Phaser.Math.RND.between(minY, maxY - 100);
      const width = Phaser.Math.RND.between(40, 120);
      const height = Phaser.Math.RND.between(40, 120);

      // 创建紫色障碍物
      const obstacle = this.add.graphics();
      obstacle.fillStyle(0x9932cc, 1); // 紫色 (DarkOrchid)
      obstacle.fillRect(0, 0, width, height);
      obstacle.setPosition(x, y);

      // 添加边框使障碍物更明显
      obstacle.lineStyle(2, 0xffffff, 1);
      obstacle.strokeRect(0, 0, width, height);

      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      label.setDepth(10);

      // 存储障碍物数据
      this.obstacles.push({
        graphics: obstacle,
        label: label,
        data: { x, y, width, height, index: i }
      });
    }

    // 在控制台输出障碍物数据用于验证确定性
    console.log('Obstacle Layout (deterministic):');
    this.obstacles.forEach(obs => {
      console.log(`#${obs.data.index + 1}: x=${obs.data.x}, y=${obs.data.y}, w=${obs.data.width}, h=${obs.data.height}`);
    });
  }

  regenerateWithNewSeed() {
    // 生成新的随机种子
    const timestamp = Date.now();
    this.currentSeed = ['seed', timestamp.toString()];
    
    // 重新设置种子
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 重新生成障碍物
    this.scene.restart();
  }

  resetWithSameSeed() {
    // 使用相同种子重新生成
    Phaser.Math.RND.sow(this.currentSeed);
    this.generateObstacles();
    this.obstacleCount = this.obstacles.length;
    this.obstacleCountText.setText(`Obstacles: ${this.obstacleCount}`);
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ObstacleScene,
  seed: ['phaser3', 'deterministic', 'layout'] // 设置初始种子
};

const game = new Phaser.Game(config);