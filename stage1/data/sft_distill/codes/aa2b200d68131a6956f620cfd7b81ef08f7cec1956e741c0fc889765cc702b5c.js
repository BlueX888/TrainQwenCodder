// 全局信号对象，用于验证场景状态
window.__signals__ = {
  loadingProgress: 0,
  loadingComplete: false,
  mainSceneActive: false,
  timestamp: Date.now()
};

// LoadingScene - 预加载场景
class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    console.log('[LoadingScene] preload started');
    window.__signals__.loadingProgress = 0;
    
    // 创建进度条背景
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);
    
    // 进度条容器（边框）
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x444444, 1);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
    
    // 进度条（紫色）
    const progressBar = this.add.graphics();
    
    // 加载文本
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px Arial',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5, 0.5);
    
    // 百分比文本
    const percentText = this.add.text(width / 2, height / 2, '0%', {
      font: '18px Arial',
      fill: '#ffffff'
    });
    percentText.setOrigin(0.5, 0.5);
    
    // 监听加载进度
    this.load.on('progress', (value) => {
      console.log('[LoadingScene] progress:', value);
      window.__signals__.loadingProgress = Math.floor(value * 100);
      
      // 绘制紫色进度条
      progressBar.clear();
      progressBar.fillStyle(0x8b00ff, 1); // 紫色
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      
      // 更新百分比文本
      percentText.setText(Math.floor(value * 100) + '%');
    });
    
    // 加载完成事件
    this.load.on('complete', () => {
      console.log('[LoadingScene] load complete');
      window.__signals__.loadingComplete = true;
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      bg.destroy();
    });
    
    // 模拟加载一些假资源（用于触发进度条）
    // 使用base64创建假图片数据
    const fakeImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    for (let i = 0; i < 10; i++) {
      this.load.image(`fake_${i}`, fakeImageData);
    }
  }

  create() {
    console.log('[LoadingScene] create - switching to MainScene');
    
    // 延迟0.5秒后切换场景，让用户看到100%
    this.time.delayedCall(500, () => {
      this.scene.start('MainScene');
    });
  }
}

// MainScene - 主游戏场景
class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.score = 0;
    this.level = 1;
    this.health = 100;
  }

  create() {
    console.log('[MainScene] create started');
    window.__signals__.mainSceneActive = true;
    window.__signals__.score = this.score;
    window.__signals__.level = this.level;
    window.__signals__.health = this.health;
    
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 背景渐变效果
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0033, 0x1a0033, 0x330066, 0x330066, 1);
    bg.fillRect(0, 0, width, height);
    
    // 标题文本
    const titleText = this.add.text(width / 2, 80, 'Main Scene', {
      font: 'bold 32px Arial',
      fill: '#ffffff',
      stroke: '#8b00ff',
      strokeThickness: 4
    });
    titleText.setOrigin(0.5, 0.5);
    
    // 状态面板
    const panel = this.add.graphics();
    panel.fillStyle(0x8b00ff, 0.3);
    panel.fillRoundedRect(width / 2 - 150, 140, 300, 120, 10);
    panel.lineStyle(2, 0x8b00ff, 1);
    panel.strokeRoundedRect(width / 2 - 150, 140, 300, 120, 10);
    
    // 状态文本
    this.scoreText = this.add.text(width / 2, 170, `Score: ${this.score}`, {
      font: '20px Arial',
      fill: '#ffffff'
    });
    this.scoreText.setOrigin(0.5, 0.5);
    
    this.levelText = this.add.text(width / 2, 200, `Level: ${this.level}`, {
      font: '20px Arial',
      fill: '#ffffff'
    });
    this.levelText.setOrigin(0.5, 0.5);
    
    this.healthText = this.add.text(width / 2, 230, `Health: ${this.health}`, {
      font: '20px Arial',
      fill: '#ffffff'
    });
    this.healthText.setOrigin(0.5, 0.5);
    
    // 创建一个可交互的紫色方块
    const square = this.add.graphics();
    square.fillStyle(0x8b00ff, 1);
    square.fillRect(0, 0, 80, 80);
    square.x = width / 2 - 40;
    square.y = height / 2 + 50;
    
    // 创建交互区域
    const interactiveZone = this.add.zone(width / 2, height / 2 + 90, 80, 80);
    interactiveZone.setInteractive({ useHandCursor: true });
    
    // 提示文本
    const hintText = this.add.text(width / 2, height / 2 + 150, 'Click the square to gain score!', {
      font: '16px Arial',
      fill: '#cccccc'
    });
    hintText.setOrigin(0.5, 0.5);
    
    // 点击方块增加分数
    interactiveZone.on('pointerdown', () => {
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      window.__signals__.score = this.score;
      
      // 每100分升级
      if (this.score % 100 === 0 && this.score > 0) {
        this.level++;
        this.levelText.setText(`Level: ${this.level}`);
        window.__signals__.level = this.level;
        
        // 升级特效
        this.cameras.main.flash(200, 139, 0, 255);
      }
      
      // 方块缩放动画
      this.tweens.add({
        targets: square,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });
      
      console.log(`[MainScene] Score: ${this.score}, Level: ${this.level}`);
    });
    
    // 鼠标悬停效果
    interactiveZone.on('pointerover', () => {
      square.clear();
      square.fillStyle(0xaa00ff, 1);
      square.fillRect(0, 0, 80, 80);
    });
    
    interactiveZone.on('pointerout', () => {
      square.clear();
      square.fillStyle(0x8b00ff, 1);
      square.fillRect(0, 0, 80, 80);
    });
    
    // 添加一些装饰性的粒子效果
    this.createParticles();
    
    console.log('[MainScene] create completed');
  }
  
  createParticles() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建多个装饰圆点
    for (let i = 0; i < 20; i++) {
      const circle = this.add.graphics();
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const radius = Phaser.Math.Between(2, 5);
      
      circle.fillStyle(0x8b00ff, 0.3);
      circle.fillCircle(x, y, radius);
      
      // 添加漂浮动画
      this.tweens.add({
        targets: circle,
        y: y + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.3, to: 0.1 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
  
  update(time, delta) {
    // 更新信号时间戳
    window.__signals__.timestamp = Date.now();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [LoadingScene, MainScene],
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化日志
console.log('[Game] Initialized with scenes:', config.scene.map(s => s.name || 'Anonymous'));
console.log('[Game] Initial signals:', JSON.stringify(window.__signals__, null, 2));