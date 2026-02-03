class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = null;
    this.obstacleCount = 0;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定的随机种子（可以修改这个值来生成不同的布局）
    this.currentSeed = ['phaser3', 'deterministic', '2024'];
    
    // 使用 Phaser 的随机数生成器设置种子
    this.game.config.seed = this.currentSeed;
    Phaser.Math.RND.sow(this.currentSeed);
    
    // 创建红色障碍物纹理
    this.createObstacleTexture();
    
    // 生成 15 个障碍物
    this.generateObstacles(15);
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 显示障碍物数量（验证状态）
    this.displayObstacleCount();
    
    // 添加重新生成按钮说明
    this.displayInstructions();
    
    // 添加键盘事件：按 R 键用新 seed 重新生成
    this.input.keyboard.on('keydown-R', () => {
      this.regenerateWithNewSeed();
    });
    
    // 添加键盘事件：按 SPACE 键用相同 seed 重新生成（验证确定性）
    this.input.keyboard.on('keydown-SPACE', () => {
      this.regenerateWithSameSeed();
    });
  }

  createObstacleTexture() {
    // 使用 Graphics 创建红色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 60, 60);
    
    // 添加边框使障碍物更明显
    graphics.lineStyle(2, 0x990000, 1);
    graphics.strokeRect(0, 0, 60, 60);
    
    // 生成纹理
    graphics.generateTexture('obstacleTexture', 60, 60);
    graphics.destroy();
  }

  generateObstacles(count) {
    // 清除之前的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];
    this.obstacleCount = 0;
    
    const margin = 80; // 边缘留白
    const minSize = 40;
    const maxSize = 80;
    
    for (let i = 0; i < count; i++) {
      // 使用确定性随机数生成位置
      const x = Phaser.Math.RND.between(margin, this.cameras.main.width - margin);
      const y = Phaser.Math.RND.between(margin, this.cameras.main.height - margin);
      
      // 使用确定性随机数生成尺寸
      const width = Phaser.Math.RND.between(minSize, maxSize);
      const height = Phaser.Math.RND.between(minSize, maxSize);
      
      // 创建障碍物（使用 Graphics 而不是 Sprite）
      const obstacle = this.add.graphics();
      obstacle.fillStyle(0xff0000, 1);
      obstacle.fillRect(x - width / 2, y - height / 2, width, height);
      
      // 添加边框
      obstacle.lineStyle(2, 0x990000, 1);
      obstacle.strokeRect(x - width / 2, y - height / 2, width, height);
      
      // 添加序号标签
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      
      this.obstacles.push(obstacle);
      this.obstacles.push(label);
      this.obstacleCount++;
    }
  }

  displaySeedInfo() {
    // 清除旧的文本
    if (this.seedText) {
      this.seedText.destroy();
    }
    
    const seedString = JSON.stringify(this.currentSeed);
    this.seedText = this.add.text(20, 20, `Current Seed: ${seedString}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  displayObstacleCount() {
    // 清除旧的文本
    if (this.countText) {
      this.countText.destroy();
    }
    
    this.countText = this.add.text(20, 60, `Obstacles Generated: ${this.obstacleCount}`, {
      fontSize: '18px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  displayInstructions() {
    // 清除旧的文本
    if (this.instructionText) {
      this.instructionText.destroy();
    }
    
    this.instructionText = this.add.text(20, this.cameras.main.height - 80, 
      'Press SPACE: Regenerate with same seed (verify determinism)\nPress R: Generate with new random seed', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  regenerateWithSameSeed() {
    // 使用相同的 seed 重新生成，验证确定性
    Phaser.Math.RND.sow(this.currentSeed);
    this.generateObstacles(15);
    this.displayObstacleCount();
    
    // 显示验证消息
    if (this.verifyText) {
      this.verifyText.destroy();
    }
    this.verifyText = this.add.text(this.cameras.main.width / 2, 100, 
      'Layout regenerated with same seed!\nPositions should be identical.', {
      fontSize: '16px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.verifyText.setOrigin(0.5);
    
    // 2秒后移除消息
    this.time.delayedCall(2000, () => {
      if (this.verifyText) {
        this.verifyText.destroy();
      }
    });
  }

  regenerateWithNewSeed() {
    // 生成新的随机 seed
    this.currentSeed = [
      'seed',
      Date.now().toString(),
      Math.random().toString()
    ];
    
    Phaser.Math.RND.sow(this.currentSeed);
    this.generateObstacles(15);
    this.displaySeedInfo();
    this.displayObstacleCount();
    
    // 显示新布局消息
    if (this.verifyText) {
      this.verifyText.destroy();
    }
    this.verifyText = this.add.text(this.cameras.main.width / 2, 100, 
      'New random seed generated!\nLayout should be different.', {
      fontSize: '16px',
      color: '#ff00ff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.verifyText.setOrigin(0.5);
    
    // 2秒后移除消息
    this.time.delayedCall(2000, () => {
      if (this.verifyText) {
        this.verifyText.destroy();
      }
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: ['phaser3', 'deterministic', '2024'], // 初始种子
  scene: DeterministicObstaclesScene
};

// 创建游戏实例
new Phaser.Game(config);