class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceActive = true;
    this.bounceProgress = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bounceActive: true,
      bounceProgress: 0,
      bounceComplete: false,
      elapsedTime: 0
    };

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建中心标题文字
    const titleText = this.add.text(400, 250, 'BOUNCE EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建状态文字
    this.statusText = this.add.text(400, 350, 'Bouncing...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.statusText.setOrigin(0.5);

    // 创建进度条背景
    const progressBg = this.add.graphics();
    progressBg.fillStyle(0x333333, 1);
    progressBg.fillRect(250, 400, 300, 30);

    // 创建进度条
    this.progressBar = this.add.graphics();

    // 创建装饰性的弹跳球
    const balls = [];
    for (let i = 0; i < 5; i++) {
      const ball = this.add.graphics();
      ball.fillStyle(0xff6b6b + i * 0x001100, 1);
      ball.fillCircle(0, 0, 20);
      ball.x = 150 + i * 125;
      ball.y = 150;
      balls.push(ball);
    }

    // 获取主相机
    const camera = this.cameras.main;

    // 记录开始时间
    const startTime = this.time.now;

    // 创建弹跳效果 - 使用shake模拟弹跳
    // 4秒内逐渐减弱的弹跳效果
    const bounceCount = 8; // 弹跳次数
    const bounceDuration = 4000; // 总持续时间4秒
    let currentBounce = 0;

    const createBounce = () => {
      if (currentBounce >= bounceCount) {
        this.bounceActive = false;
        window.__signals__.bounceActive = false;
        window.__signals__.bounceComplete = true;
        this.statusText.setText('Bounce Complete!');
        this.statusText.setColor('#ffff00');
        console.log(JSON.stringify({
          event: 'bounce_complete',
          totalTime: 4000,
          bounceCount: bounceCount
        }));
        return;
      }

      // 计算当前弹跳的强度（逐渐减弱）
      const intensity = 0.02 * (1 - currentBounce / bounceCount);
      const duration = 500 * (1 - currentBounce / bounceCount * 0.5);

      // 执行shake效果
      camera.shake(duration, intensity);

      // 同时让装饰球弹跳
      balls.forEach((ball, index) => {
        this.tweens.add({
          targets: ball,
          y: 150 - 50 * (1 - currentBounce / bounceCount),
          duration: duration / 2,
          ease: 'Quad.easeOut',
          yoyo: true
        });
      });

      currentBounce++;
      this.bounceProgress = currentBounce / bounceCount;
      window.__signals__.bounceProgress = this.bounceProgress;

      // 记录弹跳事件
      console.log(JSON.stringify({
        event: 'bounce',
        bounceNumber: currentBounce,
        intensity: intensity,
        progress: this.bounceProgress
      }));

      // 递归调用下一次弹跳
      this.time.delayedCall(duration, createBounce);
    };

    // 开始弹跳序列
    createBounce();

    // 更新进度条和时间
    this.time.addEvent({
      delay: 50,
      callback: () => {
        const elapsed = this.time.now - startTime;
        const progress = Math.min(elapsed / bounceDuration, 1);
        
        window.__signals__.elapsedTime = elapsed;
        window.__signals__.bounceProgress = progress;

        // 更新进度条
        this.progressBar.clear();
        this.progressBar.fillStyle(0x00ff00, 1);
        this.progressBar.fillRect(250, 400, 300 * progress, 30);

        // 更新状态文字
        if (this.bounceActive) {
          this.statusText.setText(`Bouncing... ${Math.floor(progress * 100)}%`);
        }
      },
      loop: true
    });

    // 4秒后确保完成
    this.time.delayedCall(4000, () => {
      this.bounceActive = false;
      window.__signals__.bounceActive = false;
      window.__signals__.bounceComplete = true;
      window.__signals__.elapsedTime = 4000;
      window.__signals__.bounceProgress = 1;
      
      console.log(JSON.stringify({
        event: 'bounce_sequence_complete',
        finalState: window.__signals__
      }));
    });

    // 添加说明文字
    const infoText = this.add.text(400, 500, 'Camera bounce effect active for 4 seconds', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });
    infoText.setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
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

// 初始日志
console.log(JSON.stringify({
  event: 'game_start',
  config: {
    width: 800,
    height: 600,
    scene: 'BounceScene'
  }
}));