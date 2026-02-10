class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = 12345; // 默认种子
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 显示当前 seed
    this.seedText = this.add.text(20, 20, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 生成障碍物
    this.generateObstacles();

    // 添加说明文本
    this.add.text(20, 60, 'Click to regenerate with new seed', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    // 添加验证文本（显示障碍物位置信息）
    this.infoText = this.add.text(20, 90, '', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    this.updateInfoText();

    // 点击屏幕重新生成（使用新 seed）
    this.input.on('pointerdown', () => {
      this.currentSeed = Date.now() % 1000000; // 生成新 seed
      this.seedText.setText(`Seed: ${this.currentSeed}`);
      this.regenerateObstacles();
    });

    // 添加重置按钮（使用原始 seed）
    const resetButton = this.add.text(20, this.scale.height - 40, 'Reset to seed 12345', {
      fontSize: '16px',
      color: '#ffff00',
      fontFamily: 'Arial',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 }
    }).setInteractive();

    resetButton.on('pointerdown', () => {
      this.currentSeed = 12345;
      this.seedText.setText(`Seed: ${this.currentSeed}`);
      this.regenerateObstacles();
    });

    resetButton.on('pointerover', () => {
      resetButton.setColor('#ffffff');
    });

    resetButton.on('pointerout', () => {
      resetButton.setColor('#ffff00');
    });
  }

  generateObstacles() {
    // 设置随机种子以确保确定性
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色

    // 生成 3 个障碍物
    for (let i = 0; i < 3; i++) {
      // 使用 Phaser 的随机数生成器确保确定性
      const x = Phaser.Math.Between(100, this.scale.width - 200);
      const y = Phaser.Math.Between(150, this.scale.height - 150);
      const width = Phaser.Math.Between(80, 150);
      const height = Phaser.Math.Between(80, 150);

      // 绘制障碍物
      graphics.fillRect(x, y, width, height);

      // 添加边框
      graphics.lineStyle(3, 0x8e44ad, 1);
      graphics.strokeRect(x, y, width, height);

      // 存储障碍物信息用于验证
      this.obstacles.push({ x, y, width, height });

      // 添加障碍物编号
      this.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }
  }

  regenerateObstacles() {
    // 清除旧的障碍物
    this.obstacles = [];
    
    // 清除所有游戏对象（保留 UI 文本）
    this.children.each((child) => {
      if (child.type === 'Graphics' || 
          (child.type === 'Text' && child !== this.seedText && 
           child !== this.infoText && !child.text.includes('Click') && 
           !child.text.includes('Reset'))) {
        child.destroy();
      }
    });

    // 重新生成障碍物
    this.generateObstacles();
    this.updateInfoText();
  }

  updateInfoText() {
    let info = 'Obstacles:\n';
    this.obstacles.forEach((obs, i) => {
      info += `#${i + 1}: (${obs.x}, ${obs.y}) ${obs.width}x${obs.height}\n`;
    });
    this.infoText.setText(info);
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: DeterministicObstaclesScene,
  seed: ['12345'] // 设置初始种子
};

// 创建游戏实例
const game = new Phaser.Game(config);