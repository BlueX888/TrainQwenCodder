class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = 12345; // 初始固定 seed
    this.obstacles = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置随机种子，确保确定性生成
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 显示当前 seed
    this.seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.seedText.setDepth(100);

    // 生成 5 个粉色障碍物
    this.generateObstacles();

    // 添加说明文本
    this.add.text(10, 50, 'Press SPACE to regenerate with new seed', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });

    this.add.text(10, 80, 'Press R to reset to original seed', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 8, y: 4 }
    });

    // 添加键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // 显示障碍物信息（用于验证确定性）
    this.infoText = this.add.text(10, 550, '', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    this.updateInfo();
  }

  generateObstacles() {
    // 清除旧障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 使用确定性随机数生成 5 个障碍物
    const obstacleCount = 5;
    const minSize = 40;
    const maxSize = 100;
    const margin = 150; // 避免生成在边缘或文字区域

    for (let i = 0; i < obstacleCount; i++) {
      // 生成随机位置和尺寸（使用 Phaser 的 RND）
      const x = Phaser.Math.RND.between(margin, 800 - margin);
      const y = Phaser.Math.RND.between(margin, 600 - margin);
      const width = Phaser.Math.RND.between(minSize, maxSize);
      const height = Phaser.Math.RND.between(minSize, maxSize);

      // 创建粉色障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff69b4, 1); // 粉色 (HotPink)
      graphics.fillRect(x - width / 2, y - height / 2, width, height);

      // 添加边框使其更明显
      graphics.lineStyle(3, 0xff1493, 1); // 深粉色边框
      graphics.strokeRect(x - width / 2, y - height / 2, width, height);

      // 添加障碍物编号
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);

      // 保存障碍物信息
      this.obstacles.push({
        graphics: graphics,
        label: label,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  }

  updateInfo() {
    // 显示障碍物位置信息用于验证确定性
    let info = 'Obstacles: ';
    this.obstacles.forEach((obs, i) => {
      info += `[${i + 1}:(${Math.round(obs.x)},${Math.round(obs.y)},${Math.round(obs.width)}x${Math.round(obs.height)})] `;
    });
    this.infoText.setText(info);
  }

  update() {
    // 按空格键生成新的 seed 并重新生成
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.currentSeed = Math.floor(Math.random() * 999999);
      this.restartWithNewSeed();
    }

    // 按 R 键重置为原始 seed
    if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
      this.currentSeed = 12345;
      this.restartWithNewSeed();
    }
  }

  restartWithNewSeed() {
    // 更新 seed 显示
    this.seedText.setText(`Seed: ${this.currentSeed}`);

    // 重新设置随机种子
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 重新生成障碍物
    this.generateObstacles();
    this.updateInfo();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: ['12345'], // 初始固定 seed
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);