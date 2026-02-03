// 场景弹跳效果实现
class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceComplete = false;
    this.bounceStartTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bounceComplete: false,
      bounceStarted: false,
      bounceProgress: 0,
      elapsedTime: 0
    };

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建场景内容容器
    this.contentContainer = this.add.container(400, 300);

    // 添加一些可视化元素到容器
    const title = this.add.graphics();
    title.fillStyle(0x00ff00, 1);
    title.fillRect(-150, -100, 300, 60);
    this.contentContainer.add(title);

    const subtitle = this.add.graphics();
    subtitle.fillStyle(0xff6600, 1);
    subtitle.fillRect(-120, -20, 240, 40);
    this.contentContainer.add(subtitle);

    // 创建装饰圆圈
    for (let i = 0; i < 5; i++) {
      const circle = this.add.graphics();
      circle.fillStyle(0x4444ff, 0.6);
      const radius = 20 + i * 10;
      circle.fillCircle(0, 80 + i * 30, radius);
      this.contentContainer.add(circle);
    }

    // 记录开始时间
    this.bounceStartTime = this.time.now;
    window.__signals__.bounceStarted = true;

    // 实现弹跳效果 - 使用缩放动画模拟弹跳
    this.tweens.add({
      targets: this.contentContainer,
      scaleX: { from: 0.3, to: 1 },
      scaleY: { from: 0.3, to: 1 },
      duration: 1500,
      ease: 'Bounce.easeOut',
      onUpdate: (tween) => {
        // 更新进度
        window.__signals__.bounceProgress = tween.progress;
        window.__signals__.elapsedTime = this.time.now - this.bounceStartTime;
      },
      onComplete: () => {
        this.bounceComplete = true;
        window.__signals__.bounceComplete = true;
        window.__signals__.elapsedTime = this.time.now - this.bounceStartTime;
        
        // 输出完成日志
        console.log(JSON.stringify({
          event: 'bounceComplete',
          duration: window.__signals__.elapsedTime,
          timestamp: Date.now()
        }));
      }
    });

    // 添加额外的旋转效果增强弹跳感
    this.tweens.add({
      targets: this.contentContainer,
      angle: { from: -10, to: 0 },
      duration: 1500,
      ease: 'Bounce.easeOut'
    });

    // 相机轻微震动效果配合弹跳
    this.cameras.main.shake(1500, 0.002);

    // 添加提示文本（在容器外，不受弹跳影响）
    const statusText = this.add.text(10, 10, 'Scene Bouncing...', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // 更新状态文本
    this.time.delayedCall(1500, () => {
      statusText.setText('Bounce Complete!');
    });
  }

  update(time, delta) {
    // 持续更新经过时间
    if (!this.bounceComplete) {
      window.__signals__.elapsedTime = time - this.bounceStartTime;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: BounceScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始化日志
console.log(JSON.stringify({
  event: 'gameInitialized',
  config: {
    width: 800,
    height: 600,
    bounceDuration: 1500
  },
  timestamp: Date.now()
}));