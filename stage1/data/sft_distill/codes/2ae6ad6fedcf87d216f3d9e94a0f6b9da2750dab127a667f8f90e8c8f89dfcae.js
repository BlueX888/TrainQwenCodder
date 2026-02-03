class DeterministicObstaclesScene extends Phaser.Scene {
  constructor() {
    super('DeterministicObstaclesScene');
    this.currentSeed = 12345; // 固定 seed，可修改此值测试确定性
    this.obstacleCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置随机数种子以确保确定性
    this.rnd = new Phaser.Math.RandomDataGenerator([this.currentSeed]);
    
    // 创建青色障碍物纹理
    this.createObstacleTexture();
    
    // 生成 8 个障碍物
    this.obstacles = [];
    this.generateObstacles();
    
    // 显示 seed 信息
    this.seedText = this.add.text(10, 10, `Seed: ${this.currentSeed}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 显示障碍物数量
    this.countText = this.add.text(10, 50, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '20px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 添加说明文字
    this.add.text(10, 90, 'Press SPACE to regenerate with new seed', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.add.text(10, 120, 'Press R to reset with same seed', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 键盘输入
    this.input.keyboard.on('keydown-SPACE', () => {
      this.currentSeed = Date.now() % 100000;
      this.scene.restart();
    });
    
    this.input.keyboard.on('keydown-R', () => {
      this.scene.restart();
    });
    
    // 输出验证信息到控制台
    console.log('=== Deterministic Obstacle Generation ===');
    console.log(`Seed: ${this.currentSeed}`);
    console.log(`Generated ${this.obstacleCount} obstacles`);
    this.obstacles.forEach((obs, index) => {
      console.log(`Obstacle ${index + 1}: x=${obs.x}, y=${obs.y}, width=${obs.displayWidth}, height=${obs.displayHeight}`);
    });
  }

  createObstacleTexture() {
    // 使用 Graphics 创建青色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillRect(0, 0, 100, 100);
    
    // 添加边框使障碍物更明显
    graphics.lineStyle(3, 0x00aaaa, 1);
    graphics.strokeRect(0, 0, 100, 100);
    
    // 生成纹理
    graphics.generateTexture('obstacleTexture', 100, 100);
    graphics.destroy();
  }

  generateObstacles() {
    // 定义游戏区域（留出边距和UI空间）
    const margin = 50;
    const topMargin = 160;
    const gameWidth = 800 - margin * 2;
    const gameHeight = 600 - topMargin - margin;
    
    // 使用确定性随机数生成器生成 8 个障碍物
    for (let i = 0; i < 8; i++) {
      // 确定性生成位置
      const x = margin + this.rnd.between(0, gameWidth);
      const y = topMargin + this.rnd.between(0, gameHeight);
      
      // 确定性生成尺寸（宽度和高度在 60-150 之间）
      const width = this.rnd.between(60, 150);
      const height = this.rnd.between(60, 150);
      
      // 创建障碍物
      const obstacle = this.add.image(x, y, 'obstacleTexture');
      obstacle.setDisplaySize(width, height);
      obstacle.setOrigin(0.5, 0.5);
      
      // 添加轻微的旋转以增加视觉变化
      const rotation = this.rnd.between(-15, 15);
      obstacle.setAngle(rotation);
      
      // 添加到障碍物数组
      this.obstacles.push(obstacle);
      this.obstacleCount++;
      
      // 添加标签显示障碍物编号
      const label = this.add.text(x, y, `${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      });
      label.setOrigin(0.5, 0.5);
    }
  }

  update(time, delta) {
    // 可以添加动画效果，但保持位置确定性
    // 这里添加一个简单的脉冲效果
    const pulseScale = 1 + Math.sin(time / 500) * 0.05;
    this.obstacles.forEach(obstacle => {
      obstacle.setScale(pulseScale);
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DeterministicObstaclesScene,
  seed: [12345] // 全局 seed 配置
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证状态
game.getObstacleData = function() {
  const scene = game.scene.scenes[0];
  return {
    seed: scene.currentSeed,
    obstacleCount: scene.obstacleCount,
    obstacles: scene.obstacles.map(obs => ({
      x: obs.x,
      y: obs.y,
      width: obs.displayWidth,
      height: obs.displayHeight,
      angle: obs.angle
    }))
  };
};