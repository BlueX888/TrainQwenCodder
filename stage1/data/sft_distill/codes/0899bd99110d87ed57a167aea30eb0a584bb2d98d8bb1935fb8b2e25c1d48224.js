// 固定 seed 值，可修改此值测试不同布局
const FIXED_SEED = ['phaser3', 'deterministic', '12345'];

class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.obstacleCount = 0;
    this.positionHash = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 显示当前 seed 信息
    const seedText = this.add.text(10, 10, `Seed: ${FIXED_SEED.join('-')}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);

    // 重新播种随机数生成器以确保确定性
    this.game.config.seed = FIXED_SEED;
    Phaser.Math.RND.sow(FIXED_SEED);

    // 生成 15 个障碍物
    const obstacles = [];
    const obstacleCount = 15;
    
    // 定义游戏区域（留出边距和顶部文本区域）
    const margin = 50;
    const topMargin = 60;
    const gameWidth = this.game.config.width;
    const gameHeight = this.game.config.height;
    
    // 使用确定性随机生成障碍物
    for (let i = 0; i < obstacleCount; i++) {
      // 生成障碍物属性
      const width = Phaser.Math.RND.between(40, 120);
      const height = Phaser.Math.RND.between(40, 120);
      const x = Phaser.Math.RND.between(margin, gameWidth - margin - width);
      const y = Phaser.Math.RND.between(topMargin + margin, gameHeight - margin - height);
      
      obstacles.push({ x, y, width, height });
      
      // 计算位置哈希值用于验证
      this.positionHash += Math.floor(x * 1000 + y * 100 + width * 10 + height);
    }

    // 绘制所有障碍物
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.fillStyle(0xffffff, 1);

    obstacles.forEach((obstacle, index) => {
      // 绘制白色填充矩形
      graphics.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // 绘制边框使障碍物更明显
      graphics.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // 在障碍物中心显示编号（黑色文字）
      const centerX = obstacle.x + obstacle.width / 2;
      const centerY = obstacle.y + obstacle.height / 2;
      this.add.text(centerX, centerY, `${index + 1}`, {
        fontSize: '14px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    this.obstacleCount = obstacleCount;

    // 显示验证信息
    const infoText = this.add.text(10, 40, 
      `Obstacles: ${this.obstacleCount} | Hash: ${this.positionHash}`, {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setDepth(100);

    // 添加说明文本
    const instructionText = this.add.text(
      gameWidth / 2, 
      gameHeight - 30, 
      'Press R to regenerate with same seed (layout should be identical)',
      {
        fontSize: '12px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    ).setOrigin(0.5);
    instructionText.setDepth(100);

    // 添加键盘输入：按 R 重新生成场景验证确定性
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });

    // 输出验证信息到控制台
    console.log('=== Deterministic Generation Verification ===');
    console.log('Seed:', FIXED_SEED.join('-'));
    console.log('Obstacle Count:', this.obstacleCount);
    console.log('Position Hash:', this.positionHash);
    console.log('First 3 obstacles:', obstacles.slice(0, 3));
    console.log('=============================================');
  }

  update(time, delta) {
    // 无需每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  seed: FIXED_SEED, // 设置全局 seed
  scene: ObstacleScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);