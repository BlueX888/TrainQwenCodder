// 场景弹跳效果实现
class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceActive = false;
    this.bounceStartTime = 0;
    this.bounceEndTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bounceStarted: false,
      bounceEnded: false,
      bounceProgress: 0,
      timestamp: Date.now()
    };

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一些可视化元素以便观察弹跳效果
    const centerX = 400;
    const centerY = 300;

    // 绘制中心圆
    const circle = this.add.graphics();
    circle.fillStyle(0xff6b6b, 1);
    circle.fillCircle(centerX, centerY, 80);

    // 绘制周围的小圆
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const x = centerX + Math.cos(angle) * 150;
      const y = centerY + Math.sin(angle) * 150;
      
      const smallCircle = this.add.graphics();
      smallCircle.fillStyle(0x4ecdc4, 1);
      smallCircle.fillCircle(x, y, 30);
    }

    // 添加文本提示
    const text = this.add.text(centerX, centerY, 'BOUNCE!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    // 记录开始时间
    this.bounceStartTime = this.time.now;
    this.bounceEndTime = this.bounceStartTime + 4000; // 4秒后结束
    this.bounceActive = true;

    // 更新信号
    window.__signals__.bounceStarted = true;
    window.__signals__.timestamp = Date.now();

    console.log(JSON.stringify({
      event: 'bounce_started',
      timestamp: Date.now(),
      duration: 4000
    }));

    // 实现弹跳效果 - 使用相机位置的Tween
    const camera = this.cameras.main;
    const originalY = camera.scrollY;

    // 创建弹跳动画：使用多个连续的tween模拟弹跳衰减
    const bounceHeight = 50; // 初始弹跳高度
    const bounceCount = 8; // 弹跳次数
    const totalDuration = 4000; // 总持续时间

    // 创建弹跳序列
    let currentTime = 0;
    for (let i = 0; i < bounceCount; i++) {
      const progress = i / bounceCount;
      const decay = 1 - progress; // 衰减因子
      const currentHeight = bounceHeight * decay;
      const bounceDuration = (totalDuration / bounceCount) / 2;

      // 向上弹
      this.tweens.add({
        targets: camera,
        scrollY: originalY - currentHeight,
        duration: bounceDuration,
        ease: 'Quad.easeOut',
        delay: currentTime
      });

      currentTime += bounceDuration;

      // 向下落
      this.tweens.add({
        targets: camera,
        scrollY: originalY,
        duration: bounceDuration,
        ease: 'Bounce.easeIn',
        delay: currentTime
      });

      currentTime += bounceDuration;
    }

    // 4秒后标记弹跳结束
    this.time.delayedCall(4000, () => {
      this.bounceActive = false;
      window.__signals__.bounceEnded = true;
      window.__signals__.bounceProgress = 1;
      window.__signals__.timestamp = Date.now();

      console.log(JSON.stringify({
        event: 'bounce_ended',
        timestamp: Date.now(),
        totalDuration: 4000
      }));

      // 确保相机回到原始位置
      camera.scrollY = originalY;

      // 更新文本
      text.setText('BOUNCE COMPLETE!');
      text.setColor('#4ecdc4');
    });
  }

  update(time, delta) {
    // 更新弹跳进度
    if (this.bounceActive) {
      const elapsed = time - this.bounceStartTime;
      const progress = Math.min(elapsed / 4000, 1);
      window.__signals__.bounceProgress = progress;

      // 每秒输出一次进度日志
      if (Math.floor(elapsed / 1000) !== Math.floor((elapsed - delta) / 1000)) {
        console.log(JSON.stringify({
          event: 'bounce_progress',
          progress: progress.toFixed(2),
          elapsed: elapsed,
          timestamp: Date.now()
        }));
      }
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

// 输出初始信号状态
console.log(JSON.stringify({
  event: 'game_initialized',
  timestamp: Date.now(),
  config: {
    width: 800,
    height: 600,
    bounceDuration: 4000
  }
}));