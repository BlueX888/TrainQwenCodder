class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    // 可验证的状态变量
    this.currentSeed = 12345; // 固定种子
    this.obstaclePositions = []; // 记录障碍物位置信息
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    Phaser.Math.RND.sow([this.currentSeed]);

    // 生成 3 个红色障碍物
    this.generateObstacles();

    // 显示当前 seed
    this.displaySeedInfo();

    // 添加重置按钮（使用不同 seed）
    this.addResetButton();

    // 输出状态信息用于验证
    console.log('Current Seed:', this.currentSeed);
    console.log('Obstacle Positions:', this.obstaclePositions);
  }

  generateObstacles() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色

    // 生成 3 个障碍物
    for (let i = 0; i < 3; i++) {
      // 使用确定性随机数生成位置和大小
      const x = Phaser.Math.RND.between(50, 700);
      const y = Phaser.Math.RND.between(100, 500);
      const width = Phaser.Math.RND.between(60, 150);
      const height = Phaser.Math.RND.between(60, 150);

      // 绘制障碍物
      graphics.fillRect(x, y, width, height);

      // 记录障碍物信息（用于验证确定性）
      this.obstaclePositions.push({
        id: i + 1,
        x: x,
        y: y,
        width: width,
        height: height
      });

      // 添加障碍物编号标签
      this.add.text(x + width / 2, y + height / 2, `#${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明文字
    const infoText = this.add.text(10, 50, 'Same seed = Same layout\nClick "New Seed" to regenerate', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示障碍物位置信息（用于验证）
    let positionInfo = 'Obstacle Positions:\n';
    this.obstaclePositions.forEach(obs => {
      positionInfo += `#${obs.id}: (${obs.x}, ${obs.y}) ${obs.width}x${obs.height}\n`;
    });

    this.add.text(10, 120, positionInfo, {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  addResetButton() {
    // 创建按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4444ff, 1);
    buttonBg.fillRoundedRect(600, 10, 180, 50, 10);

    // 按钮文字
    const buttonText = this.add.text(690, 35, 'New Seed', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 设置按钮交互
    const buttonZone = this.add.zone(690, 35, 180, 50).setInteractive();
    
    buttonZone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x6666ff, 1);
      buttonBg.fillRoundedRect(600, 10, 180, 50, 10);
    });

    buttonZone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4444ff, 1);
      buttonBg.fillRoundedRect(600, 10, 180, 50, 10);
    });

    buttonZone.on('pointerdown', () => {
      // 生成新的随机 seed
      this.currentSeed = Math.floor(Math.random() * 1000000);
      // 重启场景
      this.scene.restart();
    });
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
  backgroundColor: '#222222',
  scene: DeterministicObstaclesScene,
  // 设置全局随机种子（可选，Scene 内部会重新设置）
  seed: [12345]
};

// 创建游戏实例
const game = new Phaser.Game(config);