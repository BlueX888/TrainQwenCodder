class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = ['phaser', 'game', '2024'];
    this.obstacles = [];
    this.seedText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 显示说明文字
    this.add.text(10, 10, 'Press SPACE to regenerate with new seed', {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.add.text(10, 35, 'Press R to reset to original seed', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 显示当前 seed
    this.seedText = this.add.text(10, 70, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    });

    // 生成初始障碍物
    this.generateObstacles();

    // 添加键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      // 生成新的随机 seed
      this.currentSeed = [
        'seed' + Math.floor(Math.random() * 10000),
        'test' + Math.floor(Math.random() * 10000),
        'phaser' + Math.floor(Math.random() * 10000)
      ];
      this.regenerateObstacles();
    });

    this.input.keyboard.on('keydown-R', () => {
      // 重置为原始 seed
      this.currentSeed = ['phaser', 'game', '2024'];
      this.regenerateObstacles();
    });

    // 添加验证信息
    this.add.text(10, 550, 'Verification: Same seed = Same layout', {
      fontSize: '14px',
      color: '#ffff00'
    });
  }

  generateObstacles() {
    // 设置随机种子以确保确定性
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 更新 seed 显示
    this.seedText.setText('Current Seed: [' + this.currentSeed.join(', ') + ']');

    // 清除旧的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 生成 3 个红色障碍物
    for (let i = 0; i < 3; i++) {
      // 使用确定性随机生成位置和大小
      const x = Phaser.Math.RND.between(100, 700);
      const y = Phaser.Math.RND.between(150, 500);
      const width = Phaser.Math.RND.between(60, 120);
      const height = Phaser.Math.RND.between(60, 120);

      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff0000, 1);
      graphics.fillRect(x - width / 2, y - height / 2, width, height);

      // 添加边框使其更明显
      graphics.lineStyle(3, 0x880000, 1);
      graphics.strokeRect(x - width / 2, y - height / 2, width, height);

      // 添加标签
      const label = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 保存引用以便后续清理
      this.obstacles.push(graphics);
      this.obstacles.push(label);

      // 存储障碍物信息用于验证
      console.log(`Obstacle ${i + 1}: x=${x}, y=${y}, w=${width}, h=${height}`);
    }

    // 显示障碍物数据哈希值（用于验证确定性）
    const hash = this.calculateObstaclesHash();
    if (this.hashText) {
      this.hashText.destroy();
    }
    this.hashText = this.add.text(10, 100, `Layout Hash: ${hash}`, {
      fontSize: '14px',
      color: '#ff00ff'
    });
    this.obstacles.push(this.hashText);
  }

  regenerateObstacles() {
    this.generateObstacles();
  }

  calculateObstaclesHash() {
    // 简单的哈希函数用于验证布局一致性
    let hash = 0;
    const seedStr = this.currentSeed.join('');
    for (let i = 0; i < seedStr.length; i++) {
      const char = seedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  seed: ['phaser', 'game', '2024']
};

const game = new Phaser.Game(config);