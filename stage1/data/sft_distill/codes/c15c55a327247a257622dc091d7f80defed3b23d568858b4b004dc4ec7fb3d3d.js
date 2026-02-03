class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bounceStarted: false,
      bounceComplete: false,
      bounceProgress: 0,
      timestamp: Date.now()
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    const title = this.add.text(400, 200, 'BOUNCE EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建一些装饰性的圆形
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
    for (let i = 0; i < 4; i++) {
      const circle = this.add.graphics();
      circle.fillStyle(colors[i], 1);
      circle.fillCircle(0, 0, 30);
      circle.setPosition(200 + i * 150, 400);
    }

    // 创建状态指示文本
    this.statusText = this.add.text(400, 500, 'Bouncing...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#4ecdc4'
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 记录弹跳开始
    window.__signals__.bounceStarted = true;
    console.log(JSON.stringify({
      event: 'bounce_started',
      timestamp: Date.now()
    }));

    // 创建弹跳效果 - 使用多个 tween 组合实现
    // 1. Y 轴弹跳效果
    this.tweens.add({
      targets: camera,
      scrollY: [
        { value: -50, duration: 200, ease: 'Quad.easeOut' },
        { value: 0, duration: 300, ease: 'Bounce.easeOut' },
        { value: -30, duration: 200, ease: 'Quad.easeOut' },
        { value: 0, duration: 400, ease: 'Bounce.easeOut' },
        { value: -15, duration: 150, ease: 'Quad.easeOut' },
        { value: 0, duration: 250, ease: 'Bounce.easeOut' }
      ],
      duration: 1500,
      onUpdate: (tween) => {
        const progress = tween.progress;
        window.__signals__.bounceProgress = Math.round(progress * 100);
      },
      onComplete: () => {
        this.bounceComplete = true;
        window.__signals__.bounceComplete = true;
        this.statusText.setText('Bounce Complete!');
        this.statusText.setColor('#95e1d3');
        
        console.log(JSON.stringify({
          event: 'bounce_completed',
          duration: 1500,
          timestamp: Date.now()
        }));
      }
    });

    // 2. 缩放弹跳效果（轻微）
    this.tweens.add({
      targets: camera,
      zoom: [
        { value: 1.05, duration: 200, ease: 'Quad.easeOut' },
        { value: 0.98, duration: 300, ease: 'Quad.easeIn' },
        { value: 1.03, duration: 200, ease: 'Quad.easeOut' },
        { value: 0.99, duration: 400, ease: 'Quad.easeIn' },
        { value: 1.01, duration: 150, ease: 'Quad.easeOut' },
        { value: 1.0, duration: 250, ease: 'Quad.easeIn' }
      ],
      duration: 1500
    });

    // 添加轻微的相机抖动增强效果
    camera.shake(1500, 0.002);

    // 创建进度条
    this.progressBar = this.add.graphics();
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.fillStyle(0x222222, 1);
    this.progressBarBg.fillRect(250, 550, 300, 20);
  }

  update(time, delta) {
    // 更新进度条
    if (!this.bounceComplete) {
      const progress = window.__signals__.bounceProgress / 100;
      this.progressBar.clear();
      this.progressBar.fillStyle(0x4ecdc4, 1);
      this.progressBar.fillRect(250, 550, 300 * progress, 20);
    } else {
      // 弹跳完成后，进度条变绿
      this.progressBar.clear();
      this.progressBar.fillStyle(0x95e1d3, 1);
      this.progressBar.fillRect(250, 550, 300, 20);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: BounceScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出验证信号
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: config.width,
    height: config.height,
    bounceEffect: true,
    duration: 1500
  },
  timestamp: Date.now()
}));