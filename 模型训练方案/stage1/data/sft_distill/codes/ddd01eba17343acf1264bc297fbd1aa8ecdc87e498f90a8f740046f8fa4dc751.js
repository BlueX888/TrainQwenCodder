class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.obstacleData = [];
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const SEED = 12345; // 固定种子
    const OBSTACLE_COUNT = 12;
    const PINK_COLOR = 0xff69b4;
    
    // 设置随机数种子以确保确定性
    this.rnd = new Phaser.Math.RandomDataGenerator([SEED.toString()]);
    
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${SEED}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);
    
    // 生成 12 个障碍物
    this.obstacleData = [];
    const graphics = this.add.graphics();
    graphics.fillStyle(PINK_COLOR, 1);
    
    // 定义游戏区域（避免边缘）
    const margin = 50;
    const gameWidth = this.scale.width - margin * 2;
    const gameHeight = this.scale.height - margin * 2;
    
    // 使用确定性随机生成障碍物
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      // 使用自定义随机数生成器确保确定性
      const x = margin + this.rnd.between(0, gameWidth - 80);
      const y = margin + this.rnd.between(0, gameHeight - 80);
      const width = this.rnd.between(40, 120);
      const height = this.rnd.between(40, 120);
      
      // 绘制粉色障碍物
      graphics.fillRect(x, y, width, height);
      
      // 添加白色边框以便区分
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x, y, width, height);
      
      // 记录障碍物数据
      this.obstacleData.push({
        id: i,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height)
      });
      
      // 在障碍物上显示编号
      this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }
    
    // 添加说明文本
    this.add.text(10, 50, 'Deterministic Obstacle Generation', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    
    this.add.text(10, 80, `Total Obstacles: ${OBSTACLE_COUNT}`, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    
    // 输出可验证的信号
    window.__signals__ = {
      seed: SEED,
      obstacleCount: OBSTACLE_COUNT,
      obstacles: this.obstacleData,
      timestamp: Date.now(),
      checksum: this.calculateChecksum(this.obstacleData)
    };
    
    // 输出到控制台便于验证
    console.log('=== Deterministic Generation Report ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
    console.log('========================================');
    
    // 添加重新生成按钮（使用相同 seed 验证确定性）
    const regenerateBtn = this.add.text(
      this.scale.width - 150, 
      10, 
      'Regenerate', 
      {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#0066cc',
        padding: { x: 15, y: 8 }
      }
    );
    regenerateBtn.setInteractive({ useHandCursor: true });
    regenerateBtn.on('pointerdown', () => {
      this.scene.restart();
    });
  }
  
  // 计算校验和用于验证确定性
  calculateChecksum(data) {
    let sum = 0;
    data.forEach(obstacle => {
      sum += obstacle.x + obstacle.y + obstacle.width + obstacle.height;
    });
    return sum;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  seed: [12345] // 游戏级别的种子设置
};

const game = new Phaser.Game(config);