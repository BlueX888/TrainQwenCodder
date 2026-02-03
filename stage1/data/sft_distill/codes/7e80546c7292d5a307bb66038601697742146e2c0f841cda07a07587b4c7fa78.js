class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.currentSeed = null;
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置固定种子（可修改此值测试不同布局）
    this.currentSeed = ['phaser', 'deterministic', '2024'];
    
    // 初始化随机数生成器
    this.math.rnd.sow(this.currentSeed);
    
    // 显示当前 seed
    this.seedText = this.add.text(10, 10, `Seed: ${this.currentSeed.join('-')}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.seedText.setDepth(100);
    
    // 生成 15 个粉色障碍物
    this.generateObstacles();
    
    // 显示障碍物数量统计
    this.countText = this.add.text(10, 50, `Obstacles: ${this.obstacles.length}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setDepth(100);
    
    // 添加重新生成按钮（点击屏幕重新生成）
    this.instructionText = this.add.text(10, 90, 'Click to regenerate with new seed', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setDepth(100);
    
    // 点击事件：使用新种子重新生成
    this.input.on('pointerdown', () => {
      this.regenerateWithNewSeed();
    });
    
    // 显示障碍物坐标信息（用于验证确定性）
    this.logObstaclePositions();
  }

  generateObstacles() {
    // 清除旧障碍物
    this.obstacles.forEach(obs => obs.destroy());
    this.obstacles = [];
    
    const obstacleCount = 15;
    const minSize = 30;
    const maxSize = 80;
    const margin = 100; // 边缘留白
    
    for (let i = 0; i < obstacleCount; i++) {
      // 使用确定性随机数生成位置和大小
      const x = this.math.rnd.between(margin, this.scale.width - margin);
      const y = this.math.rnd.between(margin + 50, this.scale.height - margin);
      const width = this.math.rnd.between(minSize, maxSize);
      const height = this.math.rnd.between(minSize, maxSize);
      
      // 随机选择形状类型（矩形或圆形）
      const shapeType = this.math.rnd.between(0, 1);
      
      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      
      // 粉色填充 (0xFFC0CB)
      graphics.fillStyle(0xFFC0CB, 1);
      
      if (shapeType === 0) {
        // 绘制矩形
        graphics.fillRect(x - width / 2, y - height / 2, width, height);
      } else {
        // 绘制圆形
        const radius = (width + height) / 4;
        graphics.fillCircle(x, y, radius);
      }
      
      // 添加边框
      graphics.lineStyle(2, 0xFF69B4, 1);
      if (shapeType === 0) {
        graphics.strokeRect(x - width / 2, y - height / 2, width, height);
      } else {
        const radius = (width + height) / 4;
        graphics.strokeCircle(x, y, radius);
      }
      
      // 存储障碍物信息
      this.obstacles.push({
        graphics: graphics,
        x: x,
        y: y,
        width: width,
        height: height,
        type: shapeType === 0 ? 'rect' : 'circle'
      });
    }
  }

  regenerateWithNewSeed() {
    // 生成新的随机种子
    const timestamp = Date.now();
    this.currentSeed = ['seed', timestamp.toString()];
    
    // 重新初始化随机数生成器
    this.math.rnd.sow(this.currentSeed);
    
    // 更新 seed 显示
    this.seedText.setText(`Seed: ${this.currentSeed.join('-')}`);
    
    // 重新生成障碍物
    this.generateObstacles();
    
    // 更新计数
    this.countText.setText(`Obstacles: ${this.obstacles.length}`);
    
    // 记录新布局
    this.logObstaclePositions();
  }

  logObstaclePositions() {
    // 将障碍物位置信息输出到控制台，用于验证确定性
    console.log('=== Obstacle Layout ===');
    console.log('Seed:', this.currentSeed.join('-'));
    this.obstacles.forEach((obs, index) => {
      console.log(`Obstacle ${index + 1}: type=${obs.type}, x=${obs.x.toFixed(2)}, y=${obs.y.toFixed(2)}, w=${obs.width}, h=${obs.height}`);
    });
    console.log('======================');
  }

  update(time, delta) {
    // 可选：添加简单动画效果
    // 这里保持静态以确保确定性
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ObstacleScene,
  // 设置全局随机种子
  seed: ['phaser', 'deterministic', '2024']
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证状态信号（可通过控制台访问）
game.registry.set('obstacleCount', 15);
game.registry.set('currentSeed', config.seed.join('-'));