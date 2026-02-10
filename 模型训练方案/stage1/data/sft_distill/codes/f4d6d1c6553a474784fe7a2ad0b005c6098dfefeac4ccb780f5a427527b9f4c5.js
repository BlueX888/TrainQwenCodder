// 场景弹跳效果实现
class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceState = {
      started: false,
      completed: false,
      startTime: 0,
      endTime: 0,
      duration: 1500
    };
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 记录开始时间
    this.bounceState.startTime = Date.now();
    this.bounceState.started = true;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建中心标题文字
    const title = this.add.text(400, 300, 'BOUNCE EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建装饰性图形元素
    const circle = this.add.graphics();
    circle.fillStyle(0xe74c3c, 1);
    circle.fillCircle(400, 200, 50);

    const rect = this.add.graphics();
    rect.fillStyle(0x3498db, 1);
    rect.fillRect(350, 400, 100, 80);

    // 创建状态指示器
    this.statusText = this.add.text(400, 550, 'Bouncing...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#2ecc71'
    });
    this.statusText.setOrigin(0.5);

    // 实现弹跳效果 - 使用相机缩放和位置tweens组合
    const camera = this.cameras.main;
    
    // 方法1: 使用相机缩放实现弹跳
    this.tweens.add({
      targets: camera,
      zoom: 1.2,
      duration: 200,
      ease: 'Bounce.easeOut',
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        camera.setZoom(1);
      }
    });

    // 方法2: 使用相机Y轴位置实现垂直弹跳
    this.tweens.add({
      targets: camera,
      scrollY: -50,
      duration: 500,
      ease: 'Bounce.easeOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        camera.setScroll(0, 0);
        this.onBounceComplete();
      }
    });

    // 添加轻微的旋转效果增强弹跳感
    this.tweens.add({
      targets: camera,
      rotation: 0.05,
      duration: 300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        camera.setRotation(0);
      }
    });

    // 设置1.5秒后确保完成
    this.time.delayedCall(1500, () => {
      if (!this.bounceState.completed) {
        this.onBounceComplete();
      }
    });

    // 输出初始信号
    this.updateSignals();
  }

  onBounceComplete() {
    this.bounceState.completed = true;
    this.bounceState.endTime = Date.now();
    
    // 更新状态文字
    this.statusText.setText('Bounce Complete!');
    this.statusText.setColor('#f39c12');

    // 输出完成信号
    this.updateSignals();

    // 打印日志
    console.log(JSON.stringify({
      event: 'bounce_complete',
      duration: this.bounceState.endTime - this.bounceState.startTime,
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    // 输出可验证的状态信号
    window.__signals__ = {
      scene: 'BounceScene',
      bounceStarted: this.bounceState.started,
      bounceCompleted: this.bounceState.completed,
      startTime: this.bounceState.startTime,
      endTime: this.bounceState.endTime,
      expectedDuration: this.bounceState.duration,
      actualDuration: this.bounceState.endTime - this.bounceState.startTime,
      timestamp: Date.now()
    };

    // 输出JSON日志
    console.log(JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    // 实时更新信号
    if (this.bounceState.started && !this.bounceState.completed) {
      window.__signals__ = {
        ...window.__signals__,
        elapsedTime: Date.now() - this.bounceState.startTime,
        progress: Math.min((Date.now() - this.bounceState.startTime) / this.bounceState.duration, 1)
      };
    }
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: BounceScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  scene: 'BounceScene',
  bounceStarted: false,
  bounceCompleted: false,
  startTime: 0,
  endTime: 0,
  expectedDuration: 1500,
  actualDuration: 0,
  timestamp: Date.now()
};