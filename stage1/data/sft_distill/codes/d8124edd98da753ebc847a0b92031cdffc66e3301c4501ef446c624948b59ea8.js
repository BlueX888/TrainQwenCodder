class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = 12345; // 默认种子
    this.obstacles = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 显示当前 seed
    this.seedText = this.add.text(20, 20, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 生成障碍物
    this.generateObstacles();

    // 添加说明文本
    this.add.text(20, 60, 'Press SPACE to regenerate with new seed', {
      fontSize: '16px',
      color: '#cccccc'
    });

    this.add.text(20, 85, 'Press R to regenerate with same seed', {
      fontSize: '16px',
      color: '#cccccc'
    });

    // 键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.currentSeed = Date.now() % 1000000; // 生成新种子
      this.regenerate();
    });

    this.input.keyboard.on('keydown-R', () => {
      this.regenerate();
    });

    // 显示验证信息
    this.statusText = this.add.text(20, 550, '', {
      fontSize: '14px',
      color: '#00ff00'
    });
    this.updateStatus();
  }

  generateObstacles() {
    // 清除旧障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 使用固定种子初始化随机数生成器
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 生成 5 个粉色障碍物
    const obstacleData = [];
    
    for (let i = 0; i < 5; i++) {
      // 生成确定性的随机位置和大小
      const x = Phaser.Math.RND.between(100, 700);
      const y = Phaser.Math.RND.between(150, 500);
      const width = Phaser.Math.RND.between(60, 120);
      const height = Phaser.Math.RND.between(60, 120);
      
      obstacleData.push({ x, y, width, height });

      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      
      // 绘制粉色矩形
      graphics.fillStyle(0xff69b4, 1); // 粉色
      graphics.fillRect(x - width / 2, y - height / 2, width, height);
      
      // 绘制边框
      graphics.lineStyle(3, 0xff1493, 1); // 深粉色边框
      graphics.strokeRect(x - width / 2, y - height / 2, width, height);
      
      // 添加标签
      const label = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      
      this.obstacles.push(graphics);
      this.obstacles.push(label);
    }

    // 存储障碍物数据用于验证
    this.obstacleData = obstacleData;
  }

  regenerate() {
    this.seedText.setText(`Seed: ${this.currentSeed}`);
    this.generateObstacles();
    this.updateStatus();
  }

  updateStatus() {
    // 显示障碍物坐标信息用于验证确定性
    let statusInfo = 'Obstacles: ';
    this.obstacleData.forEach((data, i) => {
      statusInfo += `[${i + 1}:(${data.x},${data.y})] `;
    });
    this.statusText.setText(statusInfo);
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  seed: ['12345'] // 设置初始种子
};

// 创建游戏实例
const game = new Phaser.Game(config);