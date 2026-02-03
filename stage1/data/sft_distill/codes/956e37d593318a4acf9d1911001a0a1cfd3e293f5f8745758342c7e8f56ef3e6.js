class DeterministicObstacleScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstacleScene');
    this.currentSeed = 12345; // 固定种子
    this.obstacles = [];
    this.obstacleData = []; // 用于验证的障碍物数据
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机种子以确保确定性生成
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 创建紫色障碍物纹理
    this.createObstacleTexture();

    // 生成 5 个障碍物
    this.generateObstacles();

    // 显示 seed 信息
    this.displayInfo();

    // 添加重新生成按钮
    this.createRegenerateButton();
  }

  createObstacleTexture() {
    // 使用 Graphics 创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture('obstacleTexture', 80, 80);
    graphics.destroy();
  }

  generateObstacles() {
    // 清空之前的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];
    this.obstacleData = [];

    // 重新设置种子确保一致性
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 生成 5 个障碍物
    for (let i = 0; i < 5; i++) {
      // 使用确定性随机生成位置和尺寸
      const x = Phaser.Math.RND.between(100, 700);
      const y = Phaser.Math.RND.between(100, 500);
      const width = Phaser.Math.RND.between(60, 120);
      const height = Phaser.Math.RND.between(60, 120);

      // 创建障碍物（使用 Rectangle 而不是 Sprite）
      const obstacle = this.add.rectangle(x, y, width, height, 0x9932CC);
      obstacle.setStrokeStyle(2, 0x663399);

      this.obstacles.push(obstacle);

      // 记录数据用于验证
      this.obstacleData.push({
        id: i + 1,
        x: x,
        y: y,
        width: width,
        height: height
      });

      // 添加障碍物编号
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      this.obstacles.push(label);
    }
  }

  displayInfo() {
    // 清除旧的信息文本
    if (this.infoText) {
      this.infoText.destroy();
    }
    if (this.detailText) {
      this.detailText.destroy();
    }

    // 显示 seed 信息
    this.infoText = this.add.text(10, 10, 
      `Seed: ${this.currentSeed}\n` +
      `障碍物数量: ${this.obstacleData.length}`,
      {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 10 }
      }
    );

    // 显示详细障碍物信息
    let detailInfo = '障碍物详情:\n';
    this.obstacleData.forEach(data => {
      detailInfo += `#${data.id}: (${data.x}, ${data.y}) ${data.width}x${data.height}\n`;
    });

    this.detailText = this.add.text(10, 80, detailInfo, {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 8 }
    });
  }

  createRegenerateButton() {
    // 创建按钮背景
    const buttonBg = this.add.rectangle(400, 570, 200, 40, 0x4CAF50);
    buttonBg.setInteractive({ useHandCursor: true });
    buttonBg.setStrokeStyle(2, 0x45a049);

    // 按钮文本
    const buttonText = this.add.text(400, 570, '更换 Seed', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 按钮交互
    buttonBg.on('pointerdown', () => {
      // 生成新的随机 seed
      this.currentSeed = Math.floor(Math.random() * 1000000);
      
      // 重新设置种子
      this.game.config.seed = [this.currentSeed.toString()];
      Phaser.Math.RND.sow([this.currentSeed.toString()]);
      
      // 重新生成障碍物
      this.generateObstacles();
      
      // 更新信息显示
      this.displayInfo();
    });

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x45a049);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x4CAF50);
    });

    // 添加说明文本
    this.add.text(10, 550, '点击按钮更换 seed，相同 seed 将生成相同布局', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 本示例不需要 update 逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DeterministicObstacleScene,
  seed: ['12345'] // 初始种子
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 可验证的状态信号
game.registry.set('currentSeed', 12345);
game.registry.set('obstacleCount', 5);