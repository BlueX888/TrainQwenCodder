class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceComplete = false;
    this.bounceProgress = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bounceComplete: false,
      bounceProgress: 0,
      bounceStartTime: Date.now(),
      bounceEndTime: null,
      cameraScrollY: 0
    };

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建标题文字
    const title = this.add.text(400, 100, 'Scene Bounce Effect', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);

    // 创建一些装饰性的圆形
    for (let i = 0; i < 10; i++) {
      const circle = this.add.graphics();
      const x = 100 + i * 70;
      const y = 300;
      const radius = 30;
      const color = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181][i % 5];
      
      circle.fillStyle(color, 0.8);
      circle.fillCircle(x, y, radius);
    }

    // 创建状态显示文字
    this.statusText = this.add.text(400, 500, 'Bouncing: 0%', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.statusText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 实现弹跳效果：使用scrollY模拟场景上下弹跳
    this.tweens.add({
      targets: camera,
      scrollY: [
        { value: -100, duration: 500, ease: 'Cubic.easeOut' },
        { value: 50, duration: 400, ease: 'Bounce.easeOut' },
        { value: -30, duration: 300, ease: 'Bounce.easeOut' },
        { value: 15, duration: 250, ease: 'Bounce.easeOut' },
        { value: -8, duration: 200, ease: 'Bounce.easeOut' },
        { value: 0, duration: 150, ease: 'Sine.easeOut' }
      ],
      duration: 4000,
      onUpdate: (tween) => {
        // 更新进度
        this.bounceProgress = Math.floor(tween.progress * 100);
        window.__signals__.bounceProgress = this.bounceProgress;
        window.__signals__.cameraScrollY = camera.scrollY;
        
        // 更新状态文字
        this.statusText.setText(`Bouncing: ${this.bounceProgress}%`);
        
        // 输出日志
        if (this.bounceProgress % 10 === 0 && this.lastLoggedProgress !== this.bounceProgress) {
          console.log(JSON.stringify({
            type: 'bounce_progress',
            progress: this.bounceProgress,
            scrollY: camera.scrollY,
            timestamp: Date.now()
          }));
          this.lastLoggedProgress = this.bounceProgress;
        }
      },
      onComplete: () => {
        // 弹跳完成
        this.bounceComplete = true;
        window.__signals__.bounceComplete = true;
        window.__signals__.bounceEndTime = Date.now();
        
        this.statusText.setText('Bounce Complete!');
        this.statusText.setColor('#ffff00');
        
        // 输出完成日志
        console.log(JSON.stringify({
          type: 'bounce_complete',
          totalDuration: window.__signals__.bounceEndTime - window.__signals__.bounceStartTime,
          timestamp: Date.now()
        }));

        // 添加完成提示动画
        this.tweens.add({
          targets: this.statusText,
          scale: { from: 1, to: 1.2 },
          duration: 500,
          yoyo: true,
          repeat: 2
        });
      }
    });

    // 同时添加轻微的缩放效果增强弹跳感
    this.tweens.add({
      targets: camera,
      zoom: [
        { value: 1.05, duration: 500, ease: 'Cubic.easeOut' },
        { value: 0.98, duration: 400, ease: 'Bounce.easeOut' },
        { value: 1.02, duration: 300, ease: 'Bounce.easeOut' },
        { value: 0.99, duration: 250, ease: 'Bounce.easeOut' },
        { value: 1.01, duration: 200, ease: 'Bounce.easeOut' },
        { value: 1.0, duration: 150, ease: 'Sine.easeOut' }
      ],
      duration: 4000
    });

    // 初始日志
    console.log(JSON.stringify({
      type: 'bounce_start',
      duration: 4000,
      timestamp: Date.now()
    }));
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