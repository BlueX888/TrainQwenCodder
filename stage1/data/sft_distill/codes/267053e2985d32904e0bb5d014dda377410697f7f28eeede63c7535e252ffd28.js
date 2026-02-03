class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = ['phaser', '2024'];
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);

    // 创建紫色障碍物纹理
    this.createObstacleTexture();

    // 生成 5 个障碍物
    this.generateObstacles();

    // 显示当前 seed 信息
    this.displaySeedInfo();

    // 添加重置按钮
    this.createResetButton();

    // 添加说明文字
    this.createInstructions();
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    
    // 绘制紫色矩形
    graphics.fillStyle(0x9b59b6, 1);
    graphics.fillRect(0, 0, 80, 80);
    
    // 添加边框效果
    graphics.lineStyle(3, 0x8e44ad, 1);
    graphics.strokeRect(0, 0, 80, 80);
    
    // 生成纹理
    graphics.generateTexture('obstacle', 80, 80);
    graphics.destroy();
  }

  generateObstacles() {
    // 清除之前的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 重新设置种子
    Phaser.Math.RND.sow(this.currentSeed);

    // 生成 5 个障碍物
    for (let i = 0; i < 5; i++) {
      // 使用确定性随机生成位置
      const x = Phaser.Math.RND.between(100, 700);
      const y = Phaser.Math.RND.between(100, 500);
      
      // 使用确定性随机生成尺寸
      const scaleX = Phaser.Math.RND.realInRange(0.8, 2.0);
      const scaleY = Phaser.Math.RND.realInRange(0.8, 2.0);
      
      // 使用确定性随机生成旋转角度
      const rotation = Phaser.Math.RND.angle();

      // 创建障碍物
      const obstacle = this.add.image(x, y, 'obstacle');
      obstacle.setScale(scaleX, scaleY);
      obstacle.setRotation(rotation);
      
      // 添加标签显示障碍物编号
      const label = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 4, y: 2 }
      });
      label.setOrigin(0.5);

      this.obstacles.push(obstacle);
      this.obstacles.push(label);
    }
  }

  displaySeedInfo() {
    // 销毁旧的 seed 显示
    if (this.seedText) {
      this.seedText.destroy();
    }

    const seedString = JSON.stringify(this.currentSeed);
    this.seedText = this.add.text(400, 30, `Current Seed: ${seedString}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#2c3e50',
      padding: { x: 10, y: 5 }
    });
    this.seedText.setOrigin(0.5);
  }

  createResetButton() {
    // 创建按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x3498db, 1);
    buttonBg.fillRoundedRect(300, 550, 200, 40, 10);
    buttonBg.lineStyle(2, 0x2980b9, 1);
    buttonBg.strokeRoundedRect(300, 550, 200, 40, 10);

    // 创建按钮文字
    const buttonText = this.add.text(400, 570, 'Change Seed', {
      fontSize: '18px',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(400, 570, 200, 40);
    buttonZone.setInteractive({ useHandCursor: true });

    // 按钮点击事件
    buttonZone.on('pointerdown', () => {
      this.changeSeed();
    });

    // 按钮悬停效果
    buttonZone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x5dade2, 1);
      buttonBg.fillRoundedRect(300, 550, 200, 40, 10);
      buttonBg.lineStyle(2, 0x2980b9, 1);
      buttonBg.strokeRoundedRect(300, 550, 200, 40, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x3498db, 1);
      buttonBg.fillRoundedRect(300, 550, 200, 40, 10);
      buttonBg.lineStyle(2, 0x2980b9, 1);
      buttonBg.strokeRoundedRect(300, 550, 200, 40, 10);
    });

    this.buttonBg = buttonBg;
    this.buttonText = buttonText;
    this.buttonZone = buttonZone;
  }

  createInstructions() {
    this.add.text(400, 70, 'Click "Change Seed" to generate different layouts', {
      fontSize: '14px',
      color: '#ecf0f1',
      backgroundColor: '#34495e',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.add.text(400, 95, 'Same seed always produces identical obstacle positions', {
      fontSize: '14px',
      color: '#ecf0f1',
      backgroundColor: '#34495e',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
  }

  changeSeed() {
    // 生成新的随机 seed
    const seedOptions = [
      ['phaser', '2024'],
      ['deterministic', 'test'],
      ['random', 'seed', '123'],
      ['game', 'dev'],
      ['purple', 'obstacles'],
      ['fixed', 'layout']
    ];

    // 循环切换 seed
    const currentIndex = seedOptions.findIndex(
      s => JSON.stringify(s) === JSON.stringify(this.currentSeed)
    );
    const nextIndex = (currentIndex + 1) % seedOptions.length;
    this.currentSeed = seedOptions[nextIndex];

    // 重新生成障碍物
    this.generateObstacles();
    this.displaySeedInfo();
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
  backgroundColor: '#1a1a2e',
  scene: DeterministicObstaclesScene,
  seed: ['phaser', '2024'] // 初始种子
};

// 创建游戏实例
const game = new Phaser.Game(config);