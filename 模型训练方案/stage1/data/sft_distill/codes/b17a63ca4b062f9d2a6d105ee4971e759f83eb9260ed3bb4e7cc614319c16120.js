class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.obstacleCount = 0; // 验证状态变量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取配置中的 seed
    const seed = this.game.config.seed || ['default-seed'];
    
    // 使用 seed 初始化随机数生成器
    this.rnd = new Phaser.Math.RandomDataGenerator(seed);
    
    // 创建灰色障碍物纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 100, 100);
    graphics.generateTexture('obstacleTexture', 100, 100);
    graphics.destroy();
    
    // 存储障碍物引用
    this.obstacles = [];
    
    // 生成 8 个障碍物
    for (let i = 0; i < 8; i++) {
      this.createObstacle(i);
    }
    
    // 显示当前 seed
    this.seedText = this.add.text(10, 10, `Seed: ${Array.isArray(seed) ? seed[0] : seed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.seedText.setDepth(100);
    
    // 显示障碍物数量（验证状态）
    this.countText = this.add.text(10, 45, `Obstacles: ${this.obstacleCount}`, {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setDepth(100);
    
    // 显示提示信息
    this.add.text(400, 550, 'Deterministic obstacle generation based on seed', {
      fontSize: '16px',
      color: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);
    
    // 添加边框以便观察
    const border = this.add.graphics();
    border.lineStyle(2, 0xffffff, 1);
    border.strokeRect(0, 0, 800, 600);
  }
  
  createObstacle(index) {
    // 使用确定性随机数生成障碍物属性
    // 确保障碍物不会太靠近边缘，且有合理的尺寸
    
    // 宽度：50-150 像素
    const width = this.rnd.between(50, 150);
    // 高度：50-150 像素
    const height = this.rnd.between(50, 150);
    
    // 位置：留出边距，避免超出屏幕
    const margin = 50;
    const x = this.rnd.between(margin, 800 - margin - width);
    const y = this.rnd.between(100, 600 - margin - height); // 上方留出显示 seed 的空间
    
    // 创建障碍物 sprite
    const obstacle = this.add.sprite(x, y, 'obstacleTexture');
    obstacle.setOrigin(0, 0);
    obstacle.setDisplaySize(width, height);
    
    // 添加轻微的灰度变化以区分不同障碍物
    const tint = Phaser.Display.Color.GetColor(
      128 + this.rnd.between(-30, 30),
      128 + this.rnd.between(-30, 30),
      128 + this.rnd.between(-30, 30)
    );
    obstacle.setTint(tint);
    
    // 添加标签显示索引
    const label = this.add.text(x + width / 2, y + height / 2, `#${index + 1}`, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    label.setOrigin(0.5);
    label.setDepth(10);
    
    // 存储障碍物
    this.obstacles.push({
      sprite: obstacle,
      label: label,
      x: x,
      y: y,
      width: width,
      height: height
    });
    
    this.obstacleCount++;
  }
  
  update(time, delta) {
    // 可选：添加一些简单的动画效果
    // 这里保持静态以确保确定性
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: ['phaser-seed-12345'], // 固定 seed，修改此值会生成不同布局
  scene: ObstacleScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证：打印障碍物布局信息（用于测试确定性）
setTimeout(() => {
  const scene = game.scene.scenes[0];
  console.log('=== Obstacle Layout (Deterministic) ===');
  console.log('Seed:', config.seed[0]);
  console.log('Total obstacles:', scene.obstacleCount);
  scene.obstacles.forEach((obs, idx) => {
    console.log(`Obstacle #${idx + 1}: x=${obs.x}, y=${obs.y}, w=${obs.width}, h=${obs.height}`);
  });
  console.log('======================================');
}, 100);