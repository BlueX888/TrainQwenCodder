// 确定性障碍物生成系统
class ObstacleScene extends Phaser.Scene {
  constructor() {
    super('ObstacleScene');
    this.obstacleCount = 0; // 状态验证变量
    this.currentSeed = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 获取配置的 seed
    this.currentSeed = this.game.config.seed || [Date.now()];
    
    // 初始化随机数生成器，确保确定性
    this.rnd = new Phaser.Math.RandomDataGenerator(this.currentSeed);
    
    // 创建灰色障碍物纹理
    this.createObstacleTexture();
    
    // 生成 8 个障碍物
    this.generateObstacles();
    
    // 显示 seed 信息
    this.displaySeedInfo();
    
    // 显示障碍物数量统计
    this.displayStats();
    
    // 添加重新生成按钮（使用不同 seed）
    this.addRegenerateButton();
  }

  createObstacleTexture() {
    // 创建灰色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 80, 60);
    
    // 添加边框效果
    graphics.lineStyle(2, 0x606060, 1);
    graphics.strokeRect(0, 0, 80, 60);
    
    // 生成纹理
    graphics.generateTexture('obstacleTexture', 80, 60);
    graphics.destroy();
  }

  generateObstacles() {
    this.obstacles = [];
    
    // 定义安全区域（避免障碍物重叠太多）
    const margin = 100;
    const gameWidth = this.game.config.width;
    const gameHeight = this.game.config.height;
    
    // 生成 8 个障碍物
    for (let i = 0; i < 8; i++) {
      // 使用确定性随机数生成位置
      const x = this.rnd.between(margin, gameWidth - margin);
      const y = this.rnd.between(margin, gameHeight - margin);
      
      // 随机缩放（0.8 到 1.5 倍）
      const scale = this.rnd.realInRange(0.8, 1.5);
      
      // 随机旋转角度
      const rotation = this.rnd.between(0, 360);
      
      // 创建障碍物
      const obstacle = this.add.image(x, y, 'obstacleTexture');
      obstacle.setScale(scale);
      obstacle.setAngle(rotation);
      
      // 添加阴影效果（使用半透明黑色矩形）
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRect(x - 40 * scale, y + 5 - 30 * scale, 80 * scale, 60 * scale);
      shadow.setDepth(-1);
      
      // 存储障碍物信息
      this.obstacles.push({
        sprite: obstacle,
        shadow: shadow,
        x: x,
        y: y,
        scale: scale,
        rotation: rotation
      });
      
      this.obstacleCount++;
    }
    
    // 在控制台输出障碍物布局信息（用于验证确定性）
    console.log('Obstacle Layout (seed: ' + this.currentSeed + '):');
    this.obstacles.forEach((obs, index) => {
      console.log(`Obstacle ${index + 1}: x=${obs.x.toFixed(2)}, y=${obs.y.toFixed(2)}, scale=${obs.scale.toFixed(2)}, rotation=${obs.rotation}`);
    });
  }

  displaySeedInfo() {
    // 显示当前 seed
    const seedText = this.add.text(10, 10, `Current Seed: ${this.currentSeed}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    seedText.setDepth(100);
    
    // 添加说明文本
    const infoText = this.add.text(10, 40, 'Same seed = Same layout', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setDepth(100);
  }

  displayStats() {
    // 显示统计信息
    const statsText = this.add.text(10, 75, `Obstacles: ${this.obstacleCount} / 8`, {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    statsText.setDepth(100);
  }

  addRegenerateButton() {
    // 创建按钮背景
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x4444ff, 1);
    buttonBg.fillRoundedRect(10, this.game.config.height - 50, 200, 40, 10);
    buttonBg.lineStyle(2, 0xffffff, 1);
    buttonBg.strokeRoundedRect(10, this.game.config.height - 50, 200, 40, 10);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(10, this.game.config.height - 50, 200, 40),
      Phaser.Geom.Rectangle.Contains
    );
    buttonBg.setDepth(100);
    
    // 按钮文本
    const buttonText = this.add.text(110, this.game.config.height - 30, 'New Random Seed', {
      fontSize: '14px',
      color: '#ffffff'
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(101);
    
    // 点击事件
    buttonBg.on('pointerdown', () => {
      // 生成新的随机 seed
      const newSeed = [Date.now()];
      
      // 重启场景并使用新 seed
      this.game.config.seed = newSeed;
      this.scene.restart();
    });
    
    // 悬停效果
    buttonBg.on('pointerover', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x6666ff, 1);
      buttonBg.fillRoundedRect(10, this.game.config.height - 50, 200, 40, 10);
      buttonBg.lineStyle(2, 0xffffff, 1);
      buttonBg.strokeRoundedRect(10, this.game.config.height - 50, 200, 40, 10);
    });
    
    buttonBg.on('pointerout', () => {
      buttonBg.clear();
      buttonBg.fillStyle(0x4444ff, 1);
      buttonBg.fillRoundedRect(10, this.game.config.height - 50, 200, 40, 10);
      buttonBg.lineStyle(2, 0xffffff, 1);
      buttonBg.strokeRoundedRect(10, this.game.config.height - 50, 200, 40, 10);
    });
  }

  update(time, delta) {
    // 可以添加动画效果（可选）
  }
}

// Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  seed: [12345], // 固定 seed，确保每次运行布局相同
  scene: ObstacleScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证函数：在控制台输出状态
setTimeout(() => {
  console.log('=== Verification ===');
  console.log('Game seed:', game.config.seed);
  console.log('Scene obstacle count:', game.scene.scenes[0].obstacleCount);
  console.log('Expected: 8 obstacles');
  console.log('Status:', game.scene.scenes[0].obstacleCount === 8 ? 'PASS' : 'FAIL');
}, 1000);