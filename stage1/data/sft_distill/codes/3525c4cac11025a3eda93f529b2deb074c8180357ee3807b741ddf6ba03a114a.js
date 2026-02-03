class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentSeed = null;
    this.obstacleData = [];
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置固定 seed（可以修改这个值来生成不同布局）
    this.currentSeed = ['phaser3', 'deterministic', 'layout', '2024'];
    
    // 初始化随机数生成器
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 生成障碍物数据（确定性）
    this.generateObstacles();
    
    // 绘制障碍物
    this.drawObstacles();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 添加重置按钮
    this.createResetButton();
    
    // 显示状态信号
    this.obstacleCount = 12;
    this.layoutId = this.calculateLayoutHash();
    
    // 显示验证信息
    this.createVerificationInfo();
  }

  generateObstacles() {
    this.obstacleData = [];
    
    // 定义游戏区域边界（留出边距）
    const margin = 50;
    const minX = margin;
    const maxX = this.cameras.main.width - margin;
    const minY = margin + 100; // 顶部留出空间显示信息
    const maxY = this.cameras.main.height - margin;
    
    // 障碍物尺寸范围
    const minSize = 40;
    const maxSize = 100;
    
    // 生成 12 个障碍物
    for (let i = 0; i < 12; i++) {
      const width = Phaser.Math.RND.between(minSize, maxSize);
      const height = Phaser.Math.RND.between(minSize, maxSize);
      const x = Phaser.Math.RND.between(minX, maxX - width);
      const y = Phaser.Math.RND.between(minY, maxY - height);
      
      this.obstacleData.push({
        id: i + 1,
        x: x,
        y: y,
        width: width,
        height: height
      });
    }
  }

  drawObstacles() {
    // 清除之前的障碍物（如果有）
    if (this.obstacleGraphics) {
      this.obstacleGraphics.destroy();
    }
    
    this.obstacleGraphics = this.add.graphics();
    
    // 绘制每个障碍物
    this.obstacleData.forEach((obstacle, index) => {
      // 紫色填充
      this.obstacleGraphics.fillStyle(0x9b59b6, 1);
      this.obstacleGraphics.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
      
      // 白色边框
      this.obstacleGraphics.lineStyle(2, 0xffffff, 1);
      this.obstacleGraphics.strokeRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
      
      // 显示障碍物编号
      const labelText = this.add.text(
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
        `${obstacle.id}`,
        {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      );
      labelText.setOrigin(0.5);
    });
  }

  displaySeedInfo() {
    // 显示 seed 信息
    const seedString = this.currentSeed.join(', ');
    
    this.seedText = this.add.text(20, 20, `Seed: [${seedString}]`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示标题
    this.titleText = this.add.text(
      this.cameras.main.width / 2,
      20,
      'Deterministic Obstacle Layout',
      {
        fontSize: '24px',
        color: '#9b59b6',
        fontStyle: 'bold'
      }
    );
    this.titleText.setOrigin(0.5, 0);
  }

  createResetButton() {
    // 创建重置按钮背景
    const buttonX = this.cameras.main.width - 120;
    const buttonY = 20;
    const buttonWidth = 100;
    const buttonHeight = 40;
    
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x3498db, 1);
    buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
    buttonGraphics.lineStyle(2, 0xffffff, 1);
    buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
    
    // 按钮文字
    const buttonText = this.add.text(
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2,
      'Regenerate',
      {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    buttonText.setOrigin(0.5);
    
    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setOrigin(0, 0).setInteractive();
    
    buttonZone.on('pointerdown', () => {
      this.regenerateLayout();
    });
    
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x2980b9, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
      buttonGraphics.lineStyle(2, 0xffffff, 1);
      buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
    });
    
    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x3498db, 1);
      buttonGraphics.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
      buttonGraphics.lineStyle(2, 0xffffff, 1);
      buttonGraphics.strokeRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 5);
    });
  }

  createVerificationInfo() {
    // 显示验证信息
    const infoY = 60;
    
    this.verificationText = this.add.text(
      20,
      infoY,
      [
        `Obstacle Count: ${this.obstacleCount}`,
        `Layout Hash: ${this.layoutId}`,
        `Status: ✓ Layout Generated`
      ],
      {
        fontSize: '14px',
        color: '#2ecc71',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 },
        lineSpacing: 5
      }
    );
  }

  calculateLayoutHash() {
    // 计算布局哈希值用于验证确定性
    let hash = 0;
    this.obstacleData.forEach(obstacle => {
      hash += obstacle.x + obstacle.y + obstacle.width + obstacle.height;
    });
    return hash.toFixed(0);
  }

  regenerateLayout() {
    // 使用相同的 seed 重新生成
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 重新生成障碍物
    this.generateObstacles();
    
    // 重新绘制
    this.drawObstacles();
    
    // 更新验证信息
    const newLayoutId = this.calculateLayoutHash();
    
    this.verificationText.setText([
      `Obstacle Count: ${this.obstacleCount}`,
      `Layout Hash: ${newLayoutId}`,
      `Status: ✓ Regenerated (${newLayoutId === this.layoutId ? 'MATCH' : 'MISMATCH'})`
    ]);
    
    // 验证确定性
    if (newLayoutId === this.layoutId) {
      this.verificationText.setColor('#2ecc71');
      console.log('✓ Deterministic generation verified: layouts match!');
    } else {
      this.verificationText.setColor('#e74c3c');
      console.log('✗ Warning: layouts do not match!');
    }
  }

  update(time, delta) {
    // 可以在这里添加动画或交互逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: GameScene,
  seed: ['phaser3', 'deterministic', 'layout', '2024'] // 设置全局 seed
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号用于验证
game.getObstacleCount = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.obstacleCount : 0;
};

game.getLayoutHash = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.layoutId : null;
};

game.getSeed = function() {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.currentSeed : null;
};

console.log('Game initialized with deterministic obstacle generation');
console.log('Click "Regenerate" button to verify same seed produces same layout');