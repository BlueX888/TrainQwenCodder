class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = null;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 seed（可以通过配置传入或使用固定值）
    this.currentSeed = this.game.config.seed || ['phaser3-seed-12345'];
    
    // 设置随机数生成器的种子
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Seed: ${this.currentSeed[0]}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);
    
    // 生成 8 个障碍物
    this.generateObstacles();
    
    // 添加重置按钮
    const resetButton = this.add.text(10, 50, 'Reset with New Seed', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#0066cc',
      padding: { x: 10, y: 5 }
    });
    resetButton.setInteractive({ useHandCursor: true });
    resetButton.on('pointerdown', () => {
      this.resetWithNewSeed();
    });
    resetButton.setDepth(100);
    
    // 添加说明文本
    this.add.text(10, 90, 'Same seed = Same layout\nClick button to change seed', {
      fontSize: '14px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setDepth(100);
    
    // 显示障碍物计数（可验证状态）
    this.obstacleCountText = this.add.text(10, 560, `Obstacles: ${this.obstacles.length}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.obstacleCountText.setDepth(100);
  }

  generateObstacles() {
    // 清除现有障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];
    
    // 定义游戏区域（避开 UI 区域）
    const gameArea = {
      x: 50,
      y: 150,
      width: 700,
      height: 400
    };
    
    // 生成 8 个障碍物
    for (let i = 0; i < 8; i++) {
      // 使用确定性随机数生成位置和尺寸
      const width = Phaser.Math.RND.between(40, 100);
      const height = Phaser.Math.RND.between(40, 100);
      const x = Phaser.Math.RND.between(gameArea.x, gameArea.x + gameArea.width - width);
      const y = Phaser.Math.RND.between(gameArea.y, gameArea.y + gameArea.height - height);
      
      // 创建障碍物 Graphics
      const graphics = this.add.graphics();
      
      // 使用不同深浅的灰色
      const grayValue = Phaser.Math.RND.between(100, 200);
      const grayColor = Phaser.Display.Color.GetColor(grayValue, grayValue, grayValue);
      
      graphics.fillStyle(grayColor, 1);
      graphics.fillRect(x, y, width, height);
      
      // 添加边框使障碍物更明显
      graphics.lineStyle(2, 0x000000, 1);
      graphics.strokeRect(x, y, width, height);
      
      // 添加障碍物编号
      const label = this.add.text(x + width / 2, y + height / 2, `${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      
      // 存储障碍物信息
      this.obstacles.push({
        graphics: graphics,
        label: label,
        x: x,
        y: y,
        width: width,
        height: height,
        color: grayColor
      });
    }
    
    // 绘制游戏区域边界
    const boundary = this.add.graphics();
    boundary.lineStyle(2, 0xffffff, 0.5);
    boundary.strokeRect(gameArea.x, gameArea.y, gameArea.width, gameArea.height);
  }

  resetWithNewSeed() {
    // 生成新的随机 seed
    const newSeed = `seed-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.currentSeed = [newSeed];
    
    // 重新设置随机数生成器
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 重新生成障碍物
    this.generateObstacles();
    
    // 更新 seed 显示
    const seedText = this.children.list.find(child => 
      child.type === 'Text' && child.text.startsWith('Seed:')
    );
    if (seedText) {
      seedText.setText(`Seed: ${this.currentSeed[0]}`);
    }
    
    // 更新障碍物计数
    if (this.obstacleCountText) {
      this.obstacleCountText.setText(`Obstacles: ${this.obstacles.length}`);
    }
    
    console.log('New seed:', this.currentSeed[0]);
    console.log('Generated obstacles:', this.obstacles.length);
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
  backgroundColor: '#2d2d2d',
  seed: ['phaser3-seed-12345'], // 固定初始 seed
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证确定性：在控制台输出种子信息
console.log('Game initialized with seed:', config.seed);
console.log('To verify determinism: Run with same seed multiple times');