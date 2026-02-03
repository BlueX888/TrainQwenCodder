class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = 12345; // 初始固定 seed
    this.obstacles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置背景色
    this.cameras.main.setBackgroundColor('#2d2d2d');

    // 显示当前 seed
    this.seedText = this.add.text(20, 20, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 生成障碍物
    this.generateObstacles();

    // 添加说明文字
    this.add.text(20, 60, 'Press SPACE to regenerate with new seed', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    this.add.text(20, 85, 'Press R to reset to original seed (12345)', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });

    // 显示障碍物信息
    this.infoText = this.add.text(20, 120, '', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    this.updateInfoText();

    // 键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.currentSeed = Math.floor(Math.random() * 100000);
      this.regenerate();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.currentSeed = 12345;
      this.regenerate();
    });
  }

  generateObstacles() {
    // 清除旧的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 使用当前 seed 初始化随机数生成器
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 生成 8 个橙色障碍物
    const obstacleCount = 8;
    const minWidth = 40;
    const maxWidth = 120;
    const minHeight = 40;
    const maxHeight = 120;
    const padding = 50; // 边界留白

    for (let i = 0; i < obstacleCount; i++) {
      // 使用确定性随机数生成位置和尺寸
      const width = Phaser.Math.RND.between(minWidth, maxWidth);
      const height = Phaser.Math.RND.between(minHeight, maxHeight);
      
      const x = Phaser.Math.RND.between(padding, 800 - padding - width);
      const y = Phaser.Math.RND.between(150 + padding, 600 - padding - height);

      // 创建 Graphics 对象绘制橙色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff8800, 1); // 橙色
      graphics.fillRect(x, y, width, height);

      // 添加边框使障碍物更清晰
      graphics.lineStyle(2, 0xffa500, 1);
      graphics.strokeRect(x, y, width, height);

      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5, 0.5);

      // 保存障碍物引用（包含 graphics 和 label）
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

  regenerate() {
    // 更新 seed 显示
    this.seedText.setText(`Seed: ${this.currentSeed}`);
    
    // 重新生成障碍物
    this.generateObstacles();
    
    // 更新信息文字
    this.updateInfoText();
  }

  updateInfoText() {
    let info = `Generated ${this.obstacles.length} obstacles:\n`;
    this.obstacles.forEach((obstacle, index) => {
      info += `#${index + 1}: (${obstacle.x}, ${obstacle.y}) ${obstacle.width}x${obstacle.height}\n`;
    });
    this.infoText.setText(info);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: ['12345'], // 设置初始 seed
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);