class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = ['phaser3', 'demo', '2024'];
    this.obstacles = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机数种子
    this.math.randomDataGenerator.sow(this.currentSeed);
    
    // 显示当前 seed
    this.seedText = this.add.text(10, 10, `Seed: ${this.currentSeed.join(', ')}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示说明
    this.add.text(10, 50, 'Click to regenerate with new seed', {
      fontSize: '16px',
      color: '#cccccc'
    });
    
    // 生成 8 个橙色障碍物
    this.generateObstacles();
    
    // 点击屏幕重新生成（使用新 seed）
    this.input.on('pointerdown', () => {
      this.regenerateWithNewSeed();
    });
    
    // 显示验证信息
    this.infoText = this.add.text(10, this.scale.height - 40, 
      'Same seed = Same layout (deterministic)', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  generateObstacles() {
    // 清除之前的障碍物
    this.obstacles.forEach(obstacle => obstacle.destroy());
    this.obstacles = [];
    
    const obstacleCount = 8;
    const minSize = 40;
    const maxSize = 80;
    const margin = 100; // 边界留白
    
    // 使用当前 seed 的 RNG 生成障碍物
    for (let i = 0; i < obstacleCount; i++) {
      // 生成确定性的随机位置和大小
      const x = this.math.randomDataGenerator.between(
        margin, 
        this.scale.width - margin
      );
      const y = this.math.randomDataGenerator.between(
        margin + 50, 
        this.scale.height - margin
      );
      const size = this.math.randomDataGenerator.between(minSize, maxSize);
      
      // 随机选择形状类型（圆形或矩形）
      const shapeType = this.math.randomDataGenerator.between(0, 1);
      
      // 创建 Graphics 对象绘制障碍物
      const graphics = this.add.graphics();
      graphics.fillStyle(0xff6600, 1); // 橙色
      graphics.lineStyle(3, 0xff9933, 1); // 浅橙色边框
      
      if (shapeType === 0) {
        // 圆形障碍物
        graphics.fillCircle(x, y, size / 2);
        graphics.strokeCircle(x, y, size / 2);
      } else {
        // 矩形障碍物
        graphics.fillRect(x - size / 2, y - size / 2, size, size);
        graphics.strokeRect(x - size / 2, y - size / 2, size, size);
      }
      
      // 添加障碍物编号
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5);
      
      // 保存障碍物引用
      this.obstacles.push(graphics);
      this.obstacles.push(label);
      
      // 存储位置信息用于验证
      if (!this.obstaclePositions) {
        this.obstaclePositions = [];
      }
      this.obstaclePositions.push({ id: i + 1, x, y, size, shapeType });
    }
    
    // 在控制台输出位置信息，用于验证确定性
    console.log('Obstacle positions with seed:', this.currentSeed);
    console.log(JSON.stringify(this.obstaclePositions, null, 2));
  }

  regenerateWithNewSeed() {
    // 生成新的随机 seed
    const timestamp = Date.now();
    const random1 = Math.floor(Math.random() * 1000);
    const random2 = Math.floor(Math.random() * 1000);
    this.currentSeed = [timestamp.toString(), random1.toString(), random2.toString()];
    
    // 更新 seed 显示
    this.seedText.setText(`Seed: ${this.currentSeed.join(', ')}`);
    
    // 重新设置种子
    this.math.randomDataGenerator.sow(this.currentSeed);
    
    // 清空位置记录
    this.obstaclePositions = [];
    
    // 重新生成障碍物
    this.generateObstacles();
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
  scene: DeterministicObstaclesScene,
  seed: ['phaser3', 'demo', '2024'] // 全局种子（可选）
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证确定性的辅助函数（可在控制台调用）
window.verifySeed = function(seed) {
  console.log('Verifying deterministic generation with seed:', seed);
  const testRNG = new Phaser.Math.RandomDataGenerator(seed);
  const positions = [];
  for (let i = 0; i < 8; i++) {
    positions.push({
      x: testRNG.between(100, 700),
      y: testRNG.between(150, 500),
      size: testRNG.between(40, 80),
      type: testRNG.between(0, 1)
    });
  }
  console.log('Generated positions:', positions);
  return positions;
};