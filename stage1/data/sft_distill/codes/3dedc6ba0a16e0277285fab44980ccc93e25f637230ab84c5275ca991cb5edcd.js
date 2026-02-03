class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = 12345; // 默认种子
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 显示标题
    this.add.text(400, 30, 'Deterministic Obstacle Generation', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 显示当前 seed
    this.seedText = this.add.text(400, 70, `Current Seed: ${this.currentSeed}`, {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 生成障碍物
    this.generateObstacles();

    // 创建重置按钮
    const resetButton = this.add.graphics();
    resetButton.fillStyle(0x4444ff, 1);
    resetButton.fillRoundedRect(320, 520, 160, 50, 10);
    
    const resetText = this.add.text(400, 545, 'New Seed', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 设置按钮交互
    const buttonZone = this.add.zone(400, 545, 160, 50).setInteractive();
    buttonZone.on('pointerdown', () => {
      this.resetWithNewSeed();
    });

    buttonZone.on('pointerover', () => {
      resetButton.clear();
      resetButton.fillStyle(0x6666ff, 1);
      resetButton.fillRoundedRect(320, 520, 160, 50, 10);
    });

    buttonZone.on('pointerout', () => {
      resetButton.clear();
      resetButton.fillStyle(0x4444ff, 1);
      resetButton.fillRoundedRect(320, 520, 160, 50, 10);
    });

    // 显示说明
    this.add.text(400, 480, 'Click "New Seed" to regenerate with different seed', {
      fontSize: '14px',
      color: '#aaaaaa',
      align: 'center'
    }).setOrigin(0.5);

    // 显示验证信息
    this.verificationText = this.add.text(400, 450, '', {
      fontSize: '14px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateVerificationInfo();
  }

  generateObstacles() {
    // 清除旧的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];

    // 设置随机种子
    this.game.config.seed = [this.currentSeed.toString()];
    Phaser.Math.RND.sow([this.currentSeed.toString()]);

    // 生成 3 个红色障碍物
    const obstacleCount = 3;
    const minWidth = 60;
    const maxWidth = 120;
    const minHeight = 60;
    const maxHeight = 120;
    const margin = 50;

    for (let i = 0; i < obstacleCount; i++) {
      // 使用确定性随机数生成位置和大小
      const width = Phaser.Math.RND.between(minWidth, maxWidth);
      const height = Phaser.Math.RND.between(minHeight, maxHeight);
      const x = Phaser.Math.RND.between(margin, 800 - margin - width);
      const y = Phaser.Math.RND.between(120, 400 - height);

      // 创建障碍物图形
      const obstacle = this.add.graphics();
      obstacle.fillStyle(0xff0000, 1);
      obstacle.fillRect(x, y, width, height);

      // 添加边框使其更明显
      obstacle.lineStyle(3, 0xaa0000, 1);
      obstacle.strokeRect(x, y, width, height);

      // 添加标签显示障碍物编号和位置
      const label = this.add.text(x + width / 2, y + height / 2, 
        `#${i + 1}\n(${x},${y})\n${width}x${height}`, {
        fontSize: '12px',
        color: '#ffffff',
        align: 'center',
        backgroundColor: '#000000',
        padding: { x: 4, y: 4 }
      }).setOrigin(0.5);

      // 保存障碍物引用
      this.obstacles.push(obstacle);
      this.obstacles.push(label);

      // 存储位置信息用于验证
      if (!this.obstacleData) {
        this.obstacleData = [];
      }
      if (this.obstacleData.length < obstacleCount) {
        this.obstacleData.push({ x, y, width, height });
      }
    }
  }

  resetWithNewSeed() {
    // 生成新的随机种子
    this.currentSeed = Math.floor(Math.random() * 1000000);
    
    // 更新 seed 显示
    this.seedText.setText(`Current Seed: ${this.currentSeed}`);
    
    // 重新生成障碍物
    this.obstacleData = [];
    this.generateObstacles();
    
    // 更新验证信息
    this.updateVerificationInfo();
  }

  updateVerificationInfo() {
    if (this.obstacleData && this.obstacleData.length === 3) {
      const hash = this.calculateLayoutHash();
      this.verificationText.setText(`Layout Hash: ${hash}`);
    }
  }

  calculateLayoutHash() {
    // 计算布局的简单哈希值用于验证
    let hash = 0;
    this.obstacleData.forEach(data => {
      hash += data.x * 1000 + data.y * 100 + data.width * 10 + data.height;
    });
    return hash.toString(16).toUpperCase();
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
  seed: ['12345'], // 初始种子
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证确定性：相同 seed 生成相同布局
console.log('=== Deterministic Generation Test ===');
console.log('Initial seed:', config.seed);
console.log('Run the game multiple times with the same seed to verify consistency');
console.log('Or click "New Seed" button to test different layouts');