class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = 12345; // 固定种子
    this.obstacleCount = 0; // 验证变量
    this.positionHash = 0; // 位置哈希值用于验证确定性
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置固定的随机种子
    this.currentSeed = 12345;
    Phaser.Math.RND.srand([this.currentSeed]);

    // 创建红色障碍物纹理
    this.createObstacleTexture();

    // 生成 15 个障碍物
    this.generateObstacles();

    // 显示当前 seed
    this.displaySeedInfo();

    // 显示验证信息
    this.displayVerificationInfo();

    // 添加重新生成按钮
    this.addRegenerateButton();
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1); // 红色
    graphics.fillRect(0, 0, 40, 40);
    
    // 添加边框使其更明显
    graphics.lineStyle(2, 0x880000, 1);
    graphics.strokeRect(0, 0, 40, 40);
    
    graphics.generateTexture('obstacle', 40, 40);
    graphics.destroy();
  }

  generateObstacles() {
    const obstacleSize = 40;
    const padding = 50;
    const minX = padding;
    const maxX = this.game.config.width - obstacleSize - padding;
    const minY = padding + 80; // 为顶部信息留空间
    const maxY = this.game.config.height - obstacleSize - padding;

    this.obstacles = [];
    this.obstacleCount = 0;
    this.positionHash = 0;

    // 生成 15 个障碍物
    for (let i = 0; i < 15; i++) {
      // 使用确定性随机数生成位置
      const x = Phaser.Math.RND.between(minX, maxX);
      const y = Phaser.Math.RND.between(minY, maxY);

      // 检查是否与已有障碍物重叠
      let overlap = false;
      const minDistance = 60; // 最小间距

      for (let j = 0; j < this.obstacles.length; j++) {
        const existingObstacle = this.obstacles[j];
        const distance = Phaser.Math.Distance.Between(
          x, y,
          existingObstacle.x, existingObstacle.y
        );

        if (distance < minDistance) {
          overlap = true;
          break;
        }
      }

      // 如果重叠，重新生成（但保持随机序列一致性）
      if (overlap) {
        // 偏移位置而不是完全重新生成
        const offsetX = Phaser.Math.RND.between(-30, 30);
        const offsetY = Phaser.Math.RND.between(-30, 30);
        const newX = Phaser.Math.Clamp(x + offsetX, minX, maxX);
        const newY = Phaser.Math.Clamp(y + offsetY, minY, maxY);

        const obstacle = this.add.image(newX, newY, 'obstacle');
        this.obstacles.push(obstacle);
      } else {
        const obstacle = this.add.image(x, y, 'obstacle');
        this.obstacles.push(obstacle);
      }

      // 计算位置哈希值（用于验证确定性）
      this.positionHash += Math.floor(this.obstacles[i].x) * 1000 + Math.floor(this.obstacles[i].y);
      this.obstacleCount++;
    }
  }

  displaySeedInfo() {
    // 显示标题
    const title = this.add.text(
      this.game.config.width / 2,
      20,
      'Deterministic Obstacle Generation',
      {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0);

    // 显示当前 seed
    this.seedText = this.add.text(
      this.game.config.width / 2,
      50,
      `Current Seed: ${this.currentSeed}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    this.seedText.setOrigin(0.5, 0);
  }

  displayVerificationInfo() {
    // 显示验证信息
    this.verificationText = this.add.text(
      10,
      this.game.config.height - 60,
      `Obstacles: ${this.obstacleCount}\nPosition Hash: ${this.positionHash}`,
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 5 }
      }
    );

    // 显示说明
    const instructions = this.add.text(
      this.game.config.width / 2,
      this.game.config.height - 30,
      'Same seed = Same layout | Click "Regenerate" to test',
      {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
        align: 'center'
      }
    );
    instructions.setOrigin(0.5, 0);
  }

  addRegenerateButton() {
    // 创建按钮背景
    const buttonWidth = 150;
    const buttonHeight = 40;
    const buttonX = this.game.config.width - buttonWidth - 20;
    const buttonY = 20;

    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4444ff, 1);
    buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    buttonBg.lineStyle(2, 0x6666ff, 1);
    buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);

    // 按钮文字
    const buttonText = this.add.text(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      'Regenerate',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    buttonText.setOrigin(0.5, 0.5);

    // 设置交互区域
    const buttonZone = this.add.zone(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      buttonWidth,
      buttonHeight
    ).setInteractive({ useHandCursor: true });

    // 按钮交互效果
    buttonZone.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x5555ff, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      buttonBg.lineStyle(2, 0x7777ff, 1);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    });

    buttonZone.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4444ff, 1);
      buttonBg.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
      buttonBg.lineStyle(2, 0x6666ff, 1);
      buttonBg.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 8);
    });

    buttonZone.on('pointerdown', () => {
      this.regenerateObstacles();
    });
  }

  regenerateObstacles() {
    // 清除现有障碍物
    if (this.obstacles) {
      this.obstacles.forEach(obstacle => obstacle.destroy());
    }

    // 重置随机种子（使用相同的种子）
    Phaser.Math.RND.srand([this.currentSeed]);

    // 重新生成障碍物
    this.generateObstacles();

    // 更新验证信息
    this.verificationText.setText(
      `Obstacles: ${this.obstacleCount}\nPosition Hash: ${this.positionHash}`
    );

    console.log(`Regenerated with seed ${this.currentSeed}: Hash = ${this.positionHash}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DeterministicObstaclesScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);