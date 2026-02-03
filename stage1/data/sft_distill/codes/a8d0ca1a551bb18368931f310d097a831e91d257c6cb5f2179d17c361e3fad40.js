class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceComplete = false; // 状态信号：弹跳是否完成
    this.bounceProgress = 0; // 状态信号：弹跳进度 (0-100)
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 创建中心装饰元素 - 用于观察弹跳效果
    const centerGraphics = this.add.graphics();
    centerGraphics.lineStyle(4, 0x00ff88, 1);
    centerGraphics.strokeRect(width / 2 - 100, height / 2 - 100, 200, 200);
    
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 50);
    
    centerGraphics.fillStyle(0xffd93d, 1);
    centerGraphics.fillCircle(width / 2 - 20, height / 2 - 10, 8);
    centerGraphics.fillCircle(width / 2 + 20, height / 2 - 10, 8);
    
    centerGraphics.lineStyle(3, 0xffd93d, 1);
    centerGraphics.strokeCircle(width / 2, height / 2 + 15, 15);

    // 创建状态显示文本
    this.statusText = this.add.text(width / 2, 50, 'Bounce Starting...', {
      fontSize: '24px',
      color: '#00ff88',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    this.progressText = this.add.text(width / 2, 90, 'Progress: 0%', {
      fontSize: '18px',
      color: '#ffd93d',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 创建提示文本
    const hintText = this.add.text(width / 2, height - 50, 'Watch the bounce effect!', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 实现弹跳效果 - 使用相机缩放(zoom)配合yoyo创建弹跳感
    const camera = this.cameras.main;
    
    // 方法1: 使用zoom弹跳效果
    this.tweens.add({
      targets: camera,
      zoom: 1.15, // 放大到1.15倍
      duration: 150, // 每次弹跳150ms
      yoyo: true, // 来回弹跳
      repeat: 7, // 重复7次（总共8次弹跳）
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        // 更新进度
        this.bounceProgress = Math.floor(tween.progress * 100);
        this.progressText.setText(`Progress: ${this.bounceProgress}%`);
      },
      onComplete: () => {
        this.bounceComplete = true;
        this.statusText.setText('Bounce Complete!');
        this.statusText.setColor('#00ff00');
        this.progressText.setText('Progress: 100%');
        
        // 显示完成消息
        const completeMsg = this.add.text(width / 2, height / 2 + 120, '✓ Bounce Effect Finished', {
          fontSize: '20px',
          color: '#00ff00',
          fontFamily: 'Arial',
          align: 'center',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
          targets: completeMsg,
          alpha: 1,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 方法2: 同时添加轻微的相机抖动增强效果
    this.time.delayedCall(100, () => {
      camera.shake(2400, 0.002); // 持续2.4秒的轻微抖动
    });

    // 添加额外的视觉反馈 - 背景闪烁
    const flashGraphics = this.add.graphics();
    flashGraphics.fillStyle(0xffffff, 0.1);
    flashGraphics.fillRect(0, 0, width, height);
    flashGraphics.setAlpha(0);

    this.tweens.add({
      targets: flashGraphics,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 7,
      ease: 'Sine.easeInOut'
    });

    // 2.5秒后确保状态更新
    this.time.delayedCall(2500, () => {
      if (!this.bounceComplete) {
        this.bounceComplete = true;
        this.statusText.setText('Bounce Complete!');
        this.statusText.setColor('#00ff00');
      }
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Bounce Complete: ${this.bounceComplete}`,
      `Bounce Progress: ${this.bounceProgress}%`,
      `Camera Zoom: ${this.cameras.main.zoom.toFixed(3)}`,
      `Time: ${(time / 1000).toFixed(1)}s`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: BounceScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 启动游戏
new Phaser.Game(config);