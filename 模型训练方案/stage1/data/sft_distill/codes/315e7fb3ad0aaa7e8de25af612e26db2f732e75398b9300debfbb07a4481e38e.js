class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.obstacleData = [];
    this.currentSeed = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 设置固定种子（可以通过 config 传入或使用默认值）
    this.currentSeed = this.game.config.seed || ['phaser3', 'obstacles', Date.now()];
    
    // 初始化随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator(this.currentSeed);
    
    // 创建粉色障碍物纹理
    this.createObstacleTexture();
    
    // 生成 12 个障碍物
    this.generateObstacles();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 输出验证信号
    this.outputSignals();
  }

  createObstacleTexture() {
    const graphics = this.add.graphics();
    
    // 绘制粉色矩形
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillRect(0, 0, 80, 80);
    
    // 添加边框使其更明显
    graphics.lineStyle(3, 0xFF1493, 1); // 深粉色边框
    graphics.strokeRect(0, 0, 80, 80);
    
    // 生成纹理
    graphics.generateTexture('obstacleTexture', 80, 80);
    graphics.destroy();
  }

  generateObstacles() {
    const obstacleCount = 12;
    const margin = 100; // 边距
    const minSize = 40;
    const maxSize = 100;
    
    // 确保物理系统已启用
    if (!this.physics.world) {
      console.error('Physics world not initialized');
      return;
    }
    
    for (let i = 0; i < obstacleCount; i++) {
      // 使用确定性随机数生成位置
      const x = this.rnd.between(margin, this.game.config.width - margin);
      const y = this.rnd.between(margin, this.game.config.height - margin);
      
      // 生成大小（在 minSize 和 maxSize 之间）
      const size = this.rnd.between(minSize, maxSize);
      
      // 创建障碍物精灵
      const obstacle = this.physics.add.sprite(x, y, 'obstacleTexture');
      
      // 设置大小
      const scale = size / 80;
      obstacle.setScale(scale);
      
      // 设置物理属性
      obstacle.setImmovable(true);
      obstacle.body.setSize(80 * scale, 80 * scale);
      
      // 添加轻微的旋转使布局更有趣
      const rotation = this.rnd.between(0, 360);
      obstacle.setAngle(rotation);
      
      // 记录障碍物数据用于验证
      this.obstacleData.push({
        id: i,
        x: Math.round(x),
        y: Math.round(y),
        size: Math.round(size),
        rotation: Math.round(rotation),
        scale: parseFloat(scale.toFixed(2))
      });
    }
  }

  displaySeedInfo() {
    // 显示 seed 信息
    const seedText = Array.isArray(this.currentSeed) 
      ? this.currentSeed.join(', ') 
      : String(this.currentSeed);
    
    const titleText = this.add.text(20, 20, 'Deterministic Obstacle Layout', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    const seedInfoText = this.add.text(20, 60, `Seed: ${seedText}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#FFD700',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    const countText = this.add.text(20, 95, `Obstacles: ${this.obstacleData.length}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#00FF00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 添加说明文字
    const infoText = this.add.text(20, this.game.config.height - 40, 
      'Same seed = Same layout. Refresh to verify determinism.', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#CCCCCC',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  outputSignals() {
    // 输出验证信号
    window.__signals__ = {
      scene: 'ObstacleScene',
      seed: this.currentSeed,
      obstacleCount: this.obstacleData.length,
      obstacles: this.obstacleData,
      timestamp: Date.now(),
      deterministic: true,
      // 生成布局哈希用于快速验证
      layoutHash: this.generateLayoutHash()
    };
    
    // 同时输出到控制台
    console.log('=== Obstacle Layout Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  generateLayoutHash() {
    // 生成简单的布局哈希用于快速验证布局一致性
    let hash = 0;
    this.obstacleData.forEach(obstacle => {
      hash += obstacle.x + obstacle.y + obstacle.size + obstacle.rotation;
    });
    return hash;
  }

  update(time, delta) {
    // 本示例不需要更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: ObstacleScene,
  // 设置固定种子以确保确定性
  seed: ['phaser3', 'pink', 'obstacles', '2024']
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 添加全局访问点用于调试
window.__game__ = game;